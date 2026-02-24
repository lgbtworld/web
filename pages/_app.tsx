import type { AppProps } from 'next/app';
import '../src/index.css';
import '../src/components/BubbleView/style.css';
import '../src/components/DomeView/style.css';
import '../src/components/Lexical/nodes/DateTimeNode/DateTimeNode.css';
import '../src/components/Lexical/nodes/ImageNode.css';
import '../src/components/Lexical/nodes/PageBreakNode/index.css';
import '../src/components/Lexical/nodes/PollNode.css';
import '../src/components/Lexical/nodes/StickyNode.css';
import '../src/components/Lexical/plugins/CodeActionMenuPlugin/components/PrettierButton/index.css';
import '../src/components/Lexical/plugins/CodeActionMenuPlugin/index.css';
import '../src/components/Lexical/plugins/CollapsiblePlugin/Collapsible.css';
import '../src/components/Lexical/plugins/CommentPlugin/index.css';
import '../src/components/Lexical/plugins/DraggableBlockPlugin/index.css';
import '../src/components/Lexical/plugins/FloatingLinkEditorPlugin/index.css';
import '../src/components/Lexical/plugins/FloatingTextFormatToolbarPlugin/index.css';
import '../src/components/Lexical/plugins/TableCellResizer/index.css';
import '../src/components/Lexical/plugins/TableOfContentsPlugin/index.css';
import '../src/components/Lexical/plugins/ToolbarPlugin/fontSize.css';
import '../src/components/Lexical/plugins/VersionsPlugin/index.css';
import '../src/components/Lexical/ui/ContentEditable.css';
import 'react-day-picker/style.css';
import RootApp from '../src/RootApp';
import type { SSRPageProps } from '../lib/ssr-props';

export default function MyApp({ Component, pageProps }: AppProps) {
  const typed = pageProps as Partial<SSRPageProps>;
  return (
    <RootApp
      initialPath={typed.initialPath || '/'}
      ssrData={typed.ssrData}
      initialTheme={typed.initialTheme || 'dark'}
      pageContent={<Component {...pageProps} />}
    />
  );
}
