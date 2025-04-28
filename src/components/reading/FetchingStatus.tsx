
interface FetchingStatusProps {
  isFetching: boolean;
}

export function FetchingStatus({ isFetching }: FetchingStatusProps) {
  if (!isFetching) return null;

  return (
    <div className="py-2 px-4 bg-coffee-light/20 rounded-md text-center text-sm text-muted-foreground">
      Mise à jour de votre liste de lecture...
    </div>
  );
}
