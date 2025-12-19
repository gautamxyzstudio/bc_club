import React, { JSX } from 'react';

export interface IHeadingProps {
  content?: string;
  customClasses?: string;
  tagType: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  underline?: boolean;
  type?: IHeadingTypes;
  compRef?: React.Ref<HTMLHeadingElement>;
}

export enum IHeadingTypes {
  heading16 = 'heading16',
  heading20 = 'heading20',
  heading24 = 'heading24',
  heading32 = 'heading32',
  heading30 = 'heading30',
  heading48 = 'heading48',
  heading60 = 'heading60',
}

const getHeadingStyles = (type: IHeadingTypes) => {
  switch (type) {
    case IHeadingTypes.heading32:
      return `xl:text-[32px] xl:leading-10 md:text-2xl text-xl`;
    case IHeadingTypes.heading16:
      return `text-base`;
    case IHeadingTypes.heading20:
      return `xl:text-xl text-lg`;
    case IHeadingTypes.heading24:
      return `md:text-2xl text-xl`;
    case IHeadingTypes.heading48:
      return ` xl:text-5xl xl:leading-14 md:text-[32px] md:leading-10 text-2xl`;
    case IHeadingTypes.heading60:
      return `xl:text-6xl xl:leading-[68px] md:text-5xl md:leading-14 text-[40px] leading-12`;
    default:
      return ` text-2xl `;
  }
};

const Heading: React.FC<IHeadingProps> = ({
  customClasses = '  ',
  content = 'BC Club',
  tagType = 'h1',
  type = IHeadingTypes.heading32,
  compRef,
}) => {
  const headingStyles = getHeadingStyles(type);
  const Tag = tagType as keyof Pick<
    JSX.IntrinsicElements,
    'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  >;
  return (
    <Tag
      ref={compRef}
      className={headingStyles + ' font-bold ' + ` ${customClasses} `}
    >
      {content}
    </Tag>
  );
};

export default Heading;
