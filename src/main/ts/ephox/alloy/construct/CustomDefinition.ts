import { FieldPresence, FieldSchema, Objects, ValueSchema } from '@ephox/boulder';
import { Arr, Fun, Merger, Option, Result } from '@ephox/katamari';

import { AlloyComponent } from '../api/component/ComponentApi';
import { SimpleOrSketchSpec, StructDomSchema } from '../api/component/SpecTypes';
import { AlloyEventRecord } from '../api/events/AlloyEvents';
import * as Fields from '../data/Fields';
import { DomDefinitionDetail, nu as NuDefinition } from '../dom/DomDefinition';
import { DomModification, nu as NuModification } from '../dom/DomModification';

// NB: Tsc requires AlloyEventHandler to be imported here.
export interface CustomDetail {
  dom: () => StructDomSchema;
  // By this stage, the components are built.
  components: () => AlloyComponent[];
  uid: () => string;
  events: () => AlloyEventRecord;
  apis: () => Record<string, Function>;
  eventOrder: () => Record<string, string[]>;
  domModification: () => Option<DomModification>;
  originalSpec: () => SimpleOrSketchSpec;
  'debug.sketcher': () => string;
}

const toInfo = (spec: SimpleOrSketchSpec): Result<CustomDetail, any> => {
  return ValueSchema.asStruct('custom.definition', ValueSchema.objOfOnly([
    FieldSchema.field('dom', 'dom', FieldPresence.strict(), ValueSchema.objOfOnly([
      // Note, no children.
      FieldSchema.strict('tag'),
      FieldSchema.defaulted('styles', {}),
      FieldSchema.defaulted('classes', []),
      FieldSchema.defaulted('attributes', {}),
      FieldSchema.option('value'),
      FieldSchema.option('innerHtml')
    ])),
    FieldSchema.strict('components'),
    FieldSchema.strict('uid'),

    FieldSchema.defaulted('events', {}),
    FieldSchema.defaulted('apis', Fun.constant({})),

    // Use mergeWith in the future when pre-built behaviours conflict
    FieldSchema.field(
      'eventOrder',
      'eventOrder',
      FieldPresence.mergeWith({
        // Note, not using constant behaviour names to avoid code size of unused behaviours
        'alloy.execute': [ 'disabling', 'alloy.base.behaviour', 'toggling' ],
        'alloy.focus': [ 'alloy.base.behaviour', 'focusing', 'keying' ],
        'alloy.system.init': [ 'alloy.base.behaviour', 'disabling', 'toggling', 'representing' ],
        'input': [ 'alloy.base.behaviour', 'representing', 'streaming', 'invalidating' ],
        'alloy.system.detached': [ 'alloy.base.behaviour', 'representing' ],
        'mousedown': [ 'focusing', 'alloy.base.behaviour', 'item-type-events' ]
      }),
      ValueSchema.anyValue()
    ),

    FieldSchema.option('domModification'),
    Fields.snapshot('originalSpec'),

    // Need to have this initially
    FieldSchema.defaulted('debug.sketcher', 'unknown')
  ]), spec);
};

const toDefinition = (detail: CustomDetail): DomDefinitionDetail => {
  const base = {
    uid: detail.uid(),
    tag: detail.dom().tag(),
    classes: detail.dom().classes(),
    attributes: detail.dom().attributes(),
    styles: detail.dom().styles(),
    domChildren: Arr.map(detail.components(), (comp) => comp.element())
  };

  return NuDefinition(Merger.deepMerge(base,
    detail.dom().innerHtml().map((h) => Objects.wrap('innerHtml', h)).getOr({ }),
    detail.dom().value().map((h) => Objects.wrap('value', h)).getOr({ })
  ));
};

const toModification = (detail: CustomDetail): DomModification => {
  return detail.domModification().fold(() => {
    return NuModification({ });
  }, NuModification);
};

// Probably want to pass info to these at some point.
const toApis = (info: CustomDetail): Record<string, Function> => {
  return info.apis();
};

const toEvents = (info: CustomDetail): AlloyEventRecord => {
  return info.events();
};

export {
  toInfo,
  toDefinition,
  toModification,
  toApis,
  toEvents
};