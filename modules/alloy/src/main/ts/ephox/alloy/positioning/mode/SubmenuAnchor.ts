import { FieldSchema } from '@ephox/boulder';
import { Option } from '@ephox/katamari';

import { AlloyComponent } from '../../api/component/ComponentApi';
import * as Fields from '../../data/Fields';
import * as Bubble from '../layout/Bubble';
import * as LinkedLayout from '../layout/LinkedLayout';
import * as Origins from '../layout/Origins';
import { Anchoring, nu as NuAnchoring, SubmenuAnchor } from './Anchoring';
import * as AnchorLayouts from './AnchorLayouts';

const placement = (
  component: AlloyComponent,
  submenuInfo: SubmenuAnchor,
  origin: Origins.OriginAdt
): Option<Anchoring> => {
  const anchorBox = Origins.toBox(origin, submenuInfo.item.element());

  const layouts = AnchorLayouts.get(
    component.element(),
    submenuInfo,
    LinkedLayout.all(),
    LinkedLayout.allRtl(),
    // No default bottomToTop layouts currently needed
    LinkedLayout.all(),
    LinkedLayout.allRtl(),
    Option.none()
  );

  return Option.some(
    NuAnchoring({
      anchorBox,
      bubble: Bubble.fallback(),
      overrides: submenuInfo.overrides,
      layouts,
      placer: Option.none()
    })
  );
};

export default [
  FieldSchema.strict('item'),
  AnchorLayouts.schema(),
  FieldSchema.defaulted('overrides', {}),
  Fields.output('placement', placement)
];
