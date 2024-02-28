import { yvers_render_verse } from './render/yvers';
import { il_render_verse }    from './render/interlinear';

export const Render = {
  yvers       : yvers_render_verse,
  interlinear : il_render_verse,
};

export default Render;
