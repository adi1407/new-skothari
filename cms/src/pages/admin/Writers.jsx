import { useCallback } from "react";
import WritersDirectory from "../../components/WritersDirectory";
import { getWriters } from "../../api";

export default function Writers() {
  const fetchWriters = useCallback(() => getWriters(), []);
  return (
    <WritersDirectory
      fetchWriters={fetchWriters}
      detailPath="/admin/writers"
      showAddWriter
      addWriterNavigateTo="/admin/users"
    />
  );
}
