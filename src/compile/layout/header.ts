/**
 * Utility for generating row / column headers
 */
import {AxisOrient} from '../../axis';
import {contains} from '../../util';
import {Orient, VgAxis, VgEncodeEntry, VgMarkGroup, VgValueRef} from '../../vega.schema';
import {FacetModel} from '../facet';
import {Model} from '../model';


export type HeaderChannel = 'row' | 'column';
export const HEADER_CHANNELS: HeaderChannel[] = ['row', 'column'];

export type HeaderType = 'header' | 'footer';
export const HEADER_TYPES: HeaderType[] = ['header', 'footer'];

/**
 * A component that represents all header, footers and title of a Vega group with layout directive.
 */
export interface LayoutHeaderComponent {
  title?: string;
  field?: string;

  // TODO: repeat and concat can have multiple header / footer.
  // Need to redesign this part a bit.

  header?: HeaderComponent;
  footer?: HeaderComponent;
}

/**
 * A component that represents one group of row/column-header/footer.
 */
export interface HeaderComponent {

  labels: boolean;

  sizeSignal: {signal: string};

  axes: VgAxis[];
}

/**
 * Params for Text Header
 */
export interface TextHeaderParams {
  channel: HeaderChannel;

  name: string;

  from?: {data: string};

  groupEncode?: VgEncodeEntry;

  offset?: number;

  roleType?: 'header' | 'title';

  textOrient?: Orient;

  textRole: string;

  textRef: VgValueRef;

  textEncodeMixins?: VgEncodeEntry;

  positionRef: VgValueRef;
}

export function getHeaderType(orient: AxisOrient) {
  if (orient === 'top' || orient === 'left') {
    return 'header';
  }
  return 'footer';
}

// FIXME: get rid of this and just make it a part of getTitleGroup
export function getTextHeader(params: TextHeaderParams): VgMarkGroup {
  const {channel, name, from, groupEncode, offset, roleType, textOrient, textRole, textEncodeMixins, textRef, positionRef} = params;

  const positionChannel = channel === 'row' ? 'y' : 'x';
  const offsetChannel = channel === 'row' ? 'x' : 'y';

  // TODO: row could be left too for footer
  const align = channel === 'row' ? 'right' : 'center';

  return {
    name,
    role: `${channel}-${roleType}`,
    type: 'group',
    ...(from ? {from} : {}),
    ...(groupEncode ? {encode: {update: groupEncode}} : {}),
    marks: [{
      type: 'text',
      role: textRole,
      encode: {
        update: {
          [positionChannel]: positionRef,
          ...(offset ? {[offsetChannel]: {value: offset}} : {}),
          ...(textOrient === 'vertical' ? {angle: {value: 270}} : {}),
          text: textRef,
          align: {value: align},
          fill: {value: 'black'},
          ...textEncodeMixins
        }
      }
    }]
  };
}


export function getTitleGroup(model: Model, channel: HeaderChannel) {
  const sizeChannel = channel === 'row' ? 'height' : 'width';
  const title = model.component.layoutHeaders[channel].title;
  return getTextHeader({
    channel,
    name: model.getName(`${channel}-title`),
    roleType: 'title',

    // TODO: support customization
    textEncodeMixins: {
      fontWeight: {value: 'bold'}
    },

    // TODO: support customizing row title orientation (horizontal / vertical)
    textOrient: (channel === 'row' ? 'vertical' : undefined),
    textRole: `${channel}-title-text`,

    // TODO: customize title
    textRef: {value: title},

    // TODO: customize alignment
    // FIXME: this is not working.  Need to wait for Jeff's layout update that include title role
    positionRef: {signal: `0.5 * ${sizeChannel}`}
  });
}


export function getHeaderGroup(model: Model, channel: HeaderChannel, headerType: HeaderType) {
  const layoutHeader = model.component.layoutHeaders[channel];
  const header = layoutHeader[headerType];
  if (header) {
    let title = null;
    if (layoutHeader.field && header.labels) {
      title = {
        orient: channel === 'row' ? 'left' : 'top',
        encode: {
          update: {
            text: {field: {parent: layoutHeader.field}},
            fontWeight: {value: 'normal'},
            angle: {value: 0},
            fontSize: {value: 10}, // default label font size
          }
        }
      };
    }

    const axes = header.axes;

    const hasAxes = axes && axes.length > 0;
    if (title || hasAxes) {
      const sizeChannel = channel === 'row' ? 'height' : 'width';

      return {
        name: model.getName(`${channel}-${headerType}`),
        type: 'group',
        role: `${channel}-${headerType}`,
        ...(layoutHeader.field ? {from: {data: model.getName(channel)}} : {}),
        ...(title ? {title} : {}),
        encode: {
          update: {
            [sizeChannel]: header.sizeSignal
          }
        },
        ...(hasAxes ? {axes} : {})
      };
    }
  }
  return null;
}
