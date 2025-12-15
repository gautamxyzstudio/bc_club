import React from 'react';

export type IDescriptionProps = {
  content?: string;
  customClasses?: string;
  type?: IDescriptionTypes;
  compRef?: React.Ref<HTMLHeadingElement> | undefined;
  isHtml?: boolean;
};

export enum IDescriptionTypes {
  dec14 = 'dec14',
  dec16 = 'dec16',
  description16 = 'description14',
}

const getDescriptionStyles = (type: IDescriptionTypes) => {
  switch (type) {
    case IDescriptionTypes.dec14:
      return `text-sm`;
    case IDescriptionTypes.dec16:
      return `xl:text-base text-sm`;
    case IDescriptionTypes.description16:
      return `text-base`;
    default:
      return `xl:text-base text-sm`;
  }
};

const Description: React.FC<IDescriptionProps> = ({
  customClasses,
  content,
  type = IDescriptionTypes.dec14,
  compRef,
  isHtml = false,
}) => {
  const styles = getDescriptionStyles(type);

  const containsHtml = isHtml || (content && /<[^>]*>/g.test(content));

  if (containsHtml) {
    return (
      <p
        ref={compRef}
        className={styles + ` ${customClasses} ` + ' '}
        dangerouslySetInnerHTML={{ __html: content || '' }}
      />
    );
  }

  return (
    <p ref={compRef} className={styles + ` ${customClasses}` + ' '}>
      {content}
    </p>
  );
};

export default Description;
