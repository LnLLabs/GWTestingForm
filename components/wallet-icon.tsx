export function WalletIcon({ icon }: { icon: string }) {
  return (
    <span
      aria-hidden
      className="mr-2 inline-block h-5 w-5 rounded bg-cover bg-center"
      style={{ backgroundImage: `url(${JSON.stringify(icon)})` }}
    />
  );
}
