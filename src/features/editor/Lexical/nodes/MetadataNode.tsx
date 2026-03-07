import type {
  DOMExportOutput,
  EditorConfig,
  ElementFormatType,
  LexicalEditor,
  NodeKey,
  Spread,
} from 'lexical';

import { BlockWithAlignableContents } from '@lexical/react/LexicalBlockWithAlignableContents';
import {
  DecoratorBlockNode,
  SerializedDecoratorBlockNode,
} from '@lexical/react/LexicalDecoratorBlockNode';

import type { JSX } from 'react';

export type OGNodePayload = {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  siteName?: string;
};

export type SerializedOGNode = Spread<
  {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    siteName?: string;
  },
  SerializedDecoratorBlockNode
>;

export class MetadataNode extends DecoratorBlockNode {
  __title: string;
  __description: string;
  __image: string;
  __url: string;
  __siteName: string;

  static getType(): string {
    return 'og';
  }

  static clone(node: MetadataNode): MetadataNode {
    return new MetadataNode(
      {
        title: node.__title,
        description: node.__description,
        image: node.__image,
        url: node.__url,
        siteName: node.__siteName,
      },
      node.__format,
      node.__key,
    );
  }

  constructor(
    payload: OGNodePayload,
    format?: ElementFormatType,
    key?: NodeKey,
  ) {
    super(format, key);

    this.__title = payload.title || '';
    this.__description = payload.description || '';
    this.__image = payload.image || '';
    this.__url = payload.url || '';
    this.__siteName = payload.siteName || '';
  }

  exportJSON(): SerializedOGNode {
    return {
      ...super.exportJSON(),
      title: this.__title,
      description: this.__description,
      image: this.__image,
      url: this.__url,
      siteName: this.__siteName,
    };
  }

  static importJSON(serializedNode: SerializedOGNode): MetadataNode {
    return $createMetadataNode({
      title: serializedNode.title,
      description: serializedNode.description,
      image: serializedNode.image,
      url: serializedNode.url,
      siteName: serializedNode.siteName,
    }).updateFromJSON(serializedNode);
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('div');
    element.setAttribute('data-lexical-og-url', this.__url);
    return { element };
  }

  decorate(editor: LexicalEditor, config: EditorConfig): JSX.Element {
    const embedBlockTheme = config.theme.embedBlock || {};

    const className = {
      base: embedBlockTheme.base || '',
      focus: embedBlockTheme.focus || '',
    };

    return (
      <BlockWithAlignableContents
        className={className}
        format={this.__format}
        nodeKey={this.getKey()}
      >
        <a
          href={this.__url}
          target="_blank"
          rel="noopener noreferrer"
          className="block group rounded-lg overflow-hidden no-underline border border-gray-200 dark:border-gray-700 hover:shadow-md transition"
        >
          {this.__image && (
            <img
              src={this.__image}
              alt={this.__title}
              className="w-full object-cover"
            />
          )}

          <div className="p-3 flex flex-col gap-1">
            {this.__siteName && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {this.__siteName}
              </div>
            )}

            <div className="font-semibold text-sm">
              {this.__title}
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
              {this.__description}
            </div>
          </div>
        </a>
      </BlockWithAlignableContents>
    );
  }
}

export function $createMetadataNode(
  payload: OGNodePayload,
): MetadataNode {
  return new MetadataNode(payload);
}

export function $isMetadataNode(
  node: unknown,
): node is MetadataNode {
  return node instanceof MetadataNode;
}