export default function BtcBackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute left-4 top-4 text-[#FF9900] font-bold underline"
    >
      &larr; Retour
    </button>
  );
}
