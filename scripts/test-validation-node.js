/**
 * Node.js test script for the validation RPC
 * Install: npm install @supabase/supabase-js
 * Run: node scripts/test-validation-node.js
 */

const { createClient } = require('@supabase/supabase-js');

// Replace with your Supabase project details
const supabaseUrl = 'https://xjumsrjuyzvsixvfwoiz.supabase.co';
const supabaseKey = 'your-anon-key-here';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testValidationRPC() {
  console.log('🧪 Testing force_validate_segment_beta RPC...\n');

  // Replace these UUIDs with actual values from your database
  const testData = {
    bookId: 'replace-with-actual-book-uuid',
    questionId: 'replace-with-actual-question-uuid',
    answer: 'test answer',
    userId: 'replace-with-actual-user-uuid'
  };

  try {
    // Test 1: Valid validation
    console.log('Test 1: Valid validation');
    const { data: result1, error: error1 } = await supabase.rpc('force_validate_segment_beta', {
      p_book_id: testData.bookId,
      p_question_id: testData.questionId,
      p_answer: testData.answer,
      p_user_id: testData.userId,
      p_used_joker: false,
      p_correct: true
    });

    if (error1) {
      console.error('❌ RPC Error:', error1);
    } else {
      console.log('✅ Result:', result1);
      console.log('Expected: { ok: true, validation_id: "...", progress_id: "...", validated_segment: number }');
    }

    console.log('\n---\n');

    // Test 2: Missing book_id (should return graceful error)
    console.log('Test 2: Missing book_id (graceful error handling)');
    const { data: result2, error: error2 } = await supabase.rpc('force_validate_segment_beta', {
      p_book_id: null,
      p_question_id: testData.questionId,
      p_answer: testData.answer,
      p_user_id: testData.userId,
      p_used_joker: false,
      p_correct: true
    });

    if (error2) {
      console.error('❌ Unexpected RPC Error:', error2);
    } else {
      console.log('✅ Result:', result2);
      console.log('Expected: { ok: false, code: "ARG_MISSING", message: "missing_required_arg" }');
    }

    console.log('\n---\n');

    // Test 3: Invalid question_id (should return graceful error)
    console.log('Test 3: Invalid question_id (graceful error handling)');
    const { data: result3, error: error3 } = await supabase.rpc('force_validate_segment_beta', {
      p_book_id: testData.bookId,
      p_question_id: '00000000-0000-0000-0000-000000000000', // Invalid UUID
      p_answer: testData.answer,
      p_user_id: testData.userId,
      p_used_joker: false,
      p_correct: true
    });

    if (error3) {
      console.error('❌ Unexpected RPC Error:', error3);
    } else {
      console.log('✅ Result:', result3);
      console.log('Expected: { ok: false, code: "QUESTION_NOT_FOUND", message: "question inconnue" }');
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

// Helper function to get test UUIDs
async function getTestUUIDs() {
  console.log('📋 Getting test UUIDs from database...\n');

  try {
    const { data: books } = await supabase.from('books').select('id, title').limit(1);
    const { data: questions } = await supabase.from('reading_questions').select('id, question').limit(1);
    const { data: profiles } = await supabase.from('profiles').select('id, username').limit(1);

    console.log('Books:', books);
    console.log('Questions:', questions);
    console.log('Profiles:', profiles);
    
    console.log('\n📝 Replace the UUIDs in testData with these values:');
    if (books?.[0]) console.log(`bookId: '${books[0].id}'`);
    if (questions?.[0]) console.log(`questionId: '${questions[0].id}'`);
    if (profiles?.[0]) console.log(`userId: '${profiles[0].id}'`);
    
  } catch (err) {
    console.error('❌ Error fetching UUIDs:', err);
  }
}

// Run tests
if (process.argv.includes('--get-uuids')) {
  getTestUUIDs();
} else {
  testValidationRPC();
}

console.log('\n💡 To get test UUIDs, run: node scripts/test-validation-node.js --get-uuids');