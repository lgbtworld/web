import { DecoratorNode, SerializedLexicalNode } from 'lexical';
import  { JSX } from 'react';

export type OGNodePayload = {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  siteName?: string;
};

export type SerializedOGNode = SerializedLexicalNode & OGNodePayload;

export class MetadataNode extends DecoratorNode<JSX.Element> {
  __title?: string;
  __description?: string;
  __image?: string;
  __url?: string;
  __siteName?: string;

  constructor({
    title = '',
    description = '',
    image = '',
    url = '',
    siteName = '',
  }: OGNodePayload = {}) {
    super();
    this.__title = title;
    this.__description = description;
    this.__image = image;
    this.__url = url;
    this.__siteName = siteName;
  }

  static getType() {
    return 'og';
  }

  static clone(node: MetadataNode) {
    return new MetadataNode({
      title: node.__title,
      description: node.__description,
      image: node.__image,
      url: node.__url,
      siteName: node.__siteName,
    });
  }

  exportJSON(): SerializedOGNode {
    return {
      type: 'og',
      version: 1,
      title: this.__title,
      description: this.__description,
      image: this.__image,
      url: this.__url,
      siteName: this.__siteName,
    };
  }

  static importJSON(serializedNode: SerializedOGNode) {
    return new MetadataNode({
      title: serializedNode.title,
      description: serializedNode.description,
      image: serializedNode.image,
      url: serializedNode.url,
      siteName: serializedNode.siteName,
    });
  }

  createDOM() {
    const div = document.createElement('div');
    return div;
  }

  updateDOM() {
    return false;
  }

  decorate() {
    return (
     <a
  href={this.__url}
  target="_blank"
  rel="noopener noreferrer"
  className="group flex w-full h-full flex-col gap-2 rounded-lg overflow-hidden duration-200 no-underline"
>
        <div className="w-full">
          <img
            src={this.__image}
            alt={this.__title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-center p-3">
          {this.__siteName && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {this.__siteName}
            </div>
          )}
          <div className="font-semibold text-sm mt-1">{this.__title}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-3">
            {this.__description}
          </div>
        </div>
      </a>
    );
  }
}

export function $createMetadataNode(payload: OGNodePayload) {
  return new MetadataNode(payload);
}