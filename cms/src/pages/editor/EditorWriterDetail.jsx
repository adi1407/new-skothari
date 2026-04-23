import WriterDetail from "../admin/WriterDetail";
import { getEditorWriterStats } from "../../api";

export default function EditorWriterDetail() {
  return <WriterDetail listPath="/editor/writers" fetchWriterStats={getEditorWriterStats} />;
}
