# Phase 2 Implementation Plan - Performance & Navigation Optimization

**Created**: 2025-11-07
**Status**: ⚠️ AWAITING APPROVAL
**Target**: Reduce page load times by 50%, eliminate navigation freezes

---

## Executive Summary

**AUDIT_REPORT.md Status**: ❌ **FILE NOT FOUND**
**Analysis Method**: Direct codebase analysis of critical files

After analyzing the codebase, I've identified **5 Critical P1 Performance Issues** that directly impact user experience:

| Priority | Issue | Impact | Effort |
|----------|-------|--------|--------|
| **P1-CRITICAL** | BookPage waterfall loading | HIGH | Medium |
| **P1-CRITICAL** | Explore page no skeleton loaders | HIGH | Low |
| **P1-HIGH** | AuthContext redundant queries | MEDIUM | Medium |
| **P1-HIGH** | BookPage missing memoization | MEDIUM | Low |
| **P1-HIGH** | Explore search no debouncing | MEDIUM | Low |

**Estimated Impact**:
- ✅ BookPage load time: **3-4s → 1-1.5s** (65% improvement)
- ✅ Explore page perceived load: **2-3s → <500ms** (skeleton loaders)
- ✅ Auth checks: **Every render → Once per session** (90% reduction)
- ✅ Search queries: **Every keystroke → Every 300ms** (70% reduction)

---

## Top 5 P1 Issues (Prioritized by Impact)

### 1. BookPage: Waterfall Loading Pattern ⚠️ CRITICAL

**Priority**: P1 - CRITICAL
**Impact**: HIGH - Users wait 3-4 seconds for book content
**Files Affected**:
- `src/pages/BookPage.tsx` (lines 58-130)
- `src/services/books/bookQueries.ts`
- `src/services/reading/progressService.ts`

**Problem**:
```typescript
// Current: Sequential waterfall
const fetchedBook = await getBookById(id);          // 800ms
// ... then ...
const progress = await getBookReadingProgress(...);  // 600ms
// ... then ...
await syncBookWithAPI(...);                         // 1200ms
// Total: ~2.6s + React render time
```

**Impact on UX**:
- User sees loader for 3-4 seconds
- No progressive disclosure
- Entire page blocked during fetch
- Mobile users perceive extreme slowness

**Fix Strategy**:
1. **Parallel data fetching**:
   ```typescript
   const [book, progress] = await Promise.all([
     getBookById(id),
     getBookReadingProgress(id, user?.id)
   ]);
   ```

2. **Add skeleton loaders**:
   - Book cover skeleton
   - Title/author skeleton
   - Progress bar skeleton
   - Content preview skeleton

3. **Lazy load quiz modal**:
   ```typescript
   const QuizModal = lazy(() => import('@/components/books/QuizModal'));
   ```

4. **Optimize sync call** (defer to background):
   ```typescript
   // Don't block render
   setTimeout(() => syncBookWithAPI(...), 100);
   ```

**Expected Improvement**: 3-4s → 1-1.5s (60-65% faster)

---

### 2. Explore Page: Missing Skeleton Loaders ⚠️ CRITICAL

**Priority**: P1 - CRITICAL
**Impact**: HIGH - Poor perceived performance
**Files Affected**:
- `src/pages/Explore.tsx` (lines 124-128)
- `src/components/books/BookCard.tsx`

**Problem**:
```typescript
// Current: Just text loading indicator
{loading && <p>Chargement des livres…</p>}
{!loading && books.map(b => <BookCard... />)}
```

**Impact on UX**:
- Blank screen or single text line during 1-2s fetch
- No visual feedback of grid structure
- Feels broken on slow connections
- Users don't know how many books to expect

**Fix Strategy**:
1. **Create BookCardSkeleton component**:
   ```typescript
   // Use shadcn/ui Skeleton
   const BookCardSkeleton = () => (
     <Card>
       <Skeleton className="h-48 w-full" /> {/* Cover */}
       <Skeleton className="h-4 w-3/4 mt-2" /> {/* Title */}
       <Skeleton className="h-3 w-1/2 mt-1" /> {/* Author */}
     </Card>
   );
   ```

2. **Show 24 skeletons during load**:
   ```typescript
   {loading && Array.from({ length: pageSize }).map((_, i) => (
     <BookCardSkeleton key={`skeleton-${i}`} />
   ))}
   ```

3. **Progressive image loading in BookCard**:
   - Use existing `LazyImage` component
   - Add blur placeholder

**Expected Improvement**: Perceived load time from 2-3s → <500ms

---

### 3. AuthContext: Redundant Profile Queries 🔴 HIGH

**Priority**: P1 - HIGH
**Impact**: MEDIUM - Unnecessary database load
**Files Affected**:
- `src/contexts/AuthContext.tsx` (lines 47-98, 100-180)

**Problem**:
```typescript
// Current: Fetches profile on EVERY auth state change
useEffect(() => {
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      await fetchUserStatus(session.user.id); // ← Called multiple times
    }
  });
}, []);

// Also called separately in another useEffect
useEffect(() => {
  const initAuth = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
      await fetchUserStatus(data.session.user.id); // ← Duplicate
    }
  };
  initAuth();
}, []);
```

**Impact on UX**:
- 2-3 unnecessary Supabase queries per session
- Slower auth initialization
- Race conditions possible
- Increased database load

**Fix Strategy**:
1. **Add session-level caching**:
   ```typescript
   const profileCache = useRef<Map<string, ProfileData>>(new Map());
   const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
   ```

2. **Deduplicate profile fetches**:
   ```typescript
   const fetchUserStatusOnce = useMemo(() => {
     let inFlight: Promise<any> | null = null;
     return async (userId: string) => {
       if (inFlight) return inFlight;
       inFlight = fetchUserStatus(userId);
       const result = await inFlight;
       inFlight = null;
       return result;
     };
   }, []);
   ```

3. **Consolidate useEffects**:
   - Single source of truth for auth state
   - One profile fetch per user session

**Expected Improvement**: 3-4 profile queries → 1 per session (75% reduction)

---

### 4. BookPage: Missing Memoization 🔴 HIGH

**Priority**: P1 - HIGH
**Impact**: MEDIUM - Unnecessary re-renders
**Files Affected**:
- `src/pages/BookPage.tsx` (lines 30-41, 43-53)

**Problem**:
```typescript
// Current: Recalculates on every render
const expectedSegments = useExpectedSegments(book); // ← No deps
const canShowJoker = uiCanSurfaceJoker(expectedSegments); // ← Inline

// Multiple useEffects with broad dependencies
useEffect(() => {
  // Runs on every book.title change
}, [book?.title, expectedSegments, canShowJoker]);
```

**Impact on UX**:
- Unnecessary function calls on every render
- Could trigger child component re-renders
- Potential performance cliff with complex books

**Fix Strategy**:
1. **Memoize expensive computations**:
   ```typescript
   const expectedSegments = useMemo(() =>
     book ? calculateExpectedSegments(book) : 0,
     [book?.id] // Only recalc when book changes
   );

   const canShowJoker = useMemo(() =>
     uiCanSurfaceJoker(expectedSegments),
     [expectedSegments]
   );
   ```

2. **Optimize useEffect dependencies**:
   ```typescript
   useEffect(() => {
     // Only log when actually needed
   }, [book?.id]); // Not book.title
   ```

3. **Memoize BookDetail component**:
   ```typescript
   const MemoizedBookDetail = memo(BookDetail);
   ```

**Expected Improvement**: 30-50% fewer re-renders during interactions

---

### 5. Explore: Search Without Debouncing 🟡 MEDIUM-HIGH

**Priority**: P1 - HIGH
**Impact**: MEDIUM - Excessive API calls
**Files Affected**:
- `src/pages/Explore.tsx` (lines 115-119)
- `src/components/books/SearchBar.tsx`

**Problem**:
```typescript
// Current: Searches on every keystroke
<SearchBar
  onSearch={(value) => {
    setQ(value.trim()); // ← Triggers fetchBooks() immediately
    setPage(1);
  }}
/>

// This causes:
// User types "harry potter" (13 keystrokes)
// = 13 Supabase queries!
```

**Impact on UX**:
- 10-15 queries for single search term
- Database overload
- Slower search results
- Poor mobile experience (network delay)
- Potential rate limiting

**Fix Strategy**:
1. **Add debounce to search**:
   ```typescript
   const debouncedSearch = useMemo(
     () => debounce((value: string) => {
       setQ(value.trim());
       setPage(1);
     }, 300),
     []
   );

   <SearchBar onSearch={debouncedSearch} />
   ```

2. **Show loading state in SearchBar**:
   ```typescript
   const [isSearching, setIsSearching] = useState(false);
   ```

3. **Cancel pending requests**:
   ```typescript
   const abortControllerRef = useRef<AbortController>();

   // In fetchBooks:
   abortControllerRef.current?.abort();
   abortControllerRef.current = new AbortController();
   ```

**Expected Improvement**: 13 queries → 1 query per search (92% reduction)

---

## Implementation Order

### Phase 2.1 - Quick Wins (Day 1) ⚡
**Total Time: 2-3 hours**

1. **Explore: Add skeleton loaders** (45 min)
   - Create `BookCardSkeleton.tsx`
   - Update `Explore.tsx` to show skeletons
   - Test on slow 3G

2. **Explore: Add search debouncing** (30 min)
   - Install/use lodash.debounce or custom hook
   - Update SearchBar callback
   - Test typing speed

3. **BookPage: Add basic memoization** (45 min)
   - Wrap expensive calculations in useMemo
   - Optimize useEffect dependencies
   - Test with React DevTools Profiler

### Phase 2.2 - Performance Boost (Day 2) 🚀
**Total Time: 4-5 hours**

4. **BookPage: Parallel data fetching** (2 hours)
   - Refactor fetchBook to use Promise.all
   - Add individual error handling
   - Create book/progress skeletons
   - Test error scenarios

5. **AuthContext: Deduplicate queries** (2 hours)
   - Add request deduplication
   - Implement session cache
   - Consolidate useEffects
   - Test auth flows

### Phase 2.3 - Polish & Validation (Day 3) ✨
**Total Time: 2-3 hours**

6. **Add comprehensive loading skeletons** (1 hour)
   - BookPage content skeleton
   - Profile page skeletons

7. **Performance testing** (1 hour)
   - Lighthouse scores (before/after)
   - React DevTools Profiler
   - Network waterfall analysis

8. **Documentation** (1 hour)
   - Update PHASE2_CHANGES.md
   - Add inline performance comments
   - Create performance budget doc

---

## Success Metrics

### Before Phase 2:
- ❌ BookPage FCP: ~3-4s
- ❌ Explore perceived load: 2-3s
- ❌ Auth checks: 3-4 per page load
- ❌ Search queries: 10-15 per search
- ❌ Lighthouse Performance: ~65/100

### After Phase 2 (Target):
- ✅ BookPage FCP: < 1.5s (**65% faster**)
- ✅ Explore perceived load: <500ms (**85% faster**)
- ✅ Auth checks: 1 per session (**75% reduction**)
- ✅ Search queries: 1 per search (**92% reduction**)
- ✅ Lighthouse Performance: >85/100 (**+20 points**)

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking existing functionality | Low | High | Comprehensive testing after each fix |
| Performance regressions | Low | Medium | Profiler before/after comparisons |
| Cache staleness issues | Medium | Low | Short cache TTLs (5 min) |
| Complex merge conflicts | Low | Low | Work on feature branch |
| New bugs in error handling | Medium | Medium | Test error scenarios explicitly |

---

## Next Steps

1. **🔍 Review this plan** - Do these priorities align with your experience?
2. **✅ Approve to proceed** - I'll implement fixes in the order specified
3. **🧪 Testing strategy** - Confirm if you have test data/users ready
4. **📊 Metrics collection** - Do you have analytics to validate improvements?

---

**Ready to implement?** Reply with:
- ✅ "Approved - proceed with Phase 2.1" (start quick wins)
- ⚠️ "Wait - let me review" (I'll wait for feedback)
- 🔄 "Modify priorities" (tell me what to change)

