import { useCallback } from "react";
import WritersDirectory from "../../components/WritersDirectory";
import { getEditorWriters } from "../../api";

export default function EditorWriters() {
  const fetchWriters = useCallback(() => getEditorWriters(), []);
  return <WritersDirectory fetchWriters={fetchWriters} detailPath="/editor/writers" />;
}
