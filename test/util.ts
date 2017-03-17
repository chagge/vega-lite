import {buildModel} from '../src/compile/common';
import {defaultConfig} from '../src/config';
import {FacetModel} from '../src/compile/facet';
import {LayerModel} from '../src/compile/layer';
import {Model} from '../src/compile/model';
import {UnitModel} from '../src/compile/unit';
import {initConfig} from '../src/config';
import {FacetSpec, LayerSpec, normalize, TopLevel, TopLevelExtendedSpec, UnitSpec} from '../src/spec';

export function parseModel(inputSpec: TopLevelExtendedSpec): Model {
  const config = initConfig(inputSpec.config);
  const spec = normalize(inputSpec, config);
  return buildModel(spec, null, '', config);
}

export function parseUnitModel(spec: TopLevel<UnitSpec>) {
  return new UnitModel(spec, null, '', initConfig(spec.config));
}

export function parseLayerModel(spec: TopLevel<LayerSpec>) {
  return new LayerModel(spec, null, '', initConfig(spec.config));
}

export function parseFacetModel(spec: TopLevel<FacetSpec>) {
  return new FacetModel(spec, null, '', initConfig(spec.config));
}
