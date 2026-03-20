import FunnelEditor from "./FunnelEditor";

export default function AdminFunnelPage({ params }: { params: { id: string } }) {
  const funnelId = Number(params.id);
  if (!Number.isFinite(funnelId)) {
    return <div className="p-8">ID không hợp lệ</div>;
  }
  return <FunnelEditor funnelId={funnelId} />;
}
