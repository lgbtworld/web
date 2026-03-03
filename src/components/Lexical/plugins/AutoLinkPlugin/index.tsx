import type {JSX} from 'react';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {
  AutoLinkPlugin,
  createLinkMatcherWithRegExp,
} from '@lexical/react/LexicalAutoLinkPlugin';
import {$insertNodeToNearestRoot} from '@lexical/utils';
import {$createYouTubeNode, YouTubeNode} from '../../nodes/YouTubeNode';
import {useEffect} from 'react';
import {TextNode} from 'lexical';

const URL_REGEX =
  /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)(?<![-.+():%])/;

const EMAIL_REGEX =
  /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;

// YouTube regex
const YOUTUBE_REGEX =
  /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

const MATCHERS = [
  createLinkMatcherWithRegExp(URL_REGEX, (text) => {
    return text.startsWith('http') ? text : `https://${text}`;
  }),
  createLinkMatcherWithRegExp(EMAIL_REGEX, (text) => {
    return `mailto:${text}`;
  }),
];

export default function LexicalAutoLinkPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // YouTube otomatik embed
    return editor.registerNodeTransform(TextNode, (textNode) => {
      const text = textNode.getTextContent();
      const match = text.match(YOUTUBE_REGEX);

      if (match) {
        const videoId = match[1];
        const youTubeNode = $createYouTubeNode(videoId);

        // Orijinal linki sil
        textNode.remove();

        // Embed node'u ekle
        $insertNodeToNearestRoot(youTubeNode);
      }
    });
  }, [editor]);

  return <AutoLinkPlugin matchers={MATCHERS} />;
}