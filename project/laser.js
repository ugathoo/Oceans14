import {tiny} from '../tiny-graphics.js';
import {widgets} from '../tiny-graphics-widgets.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, Matrix, Mat4,
    Light, Shape, Material, Shader, Texture, Scene
} = tiny;

Object.assign(tiny, widgets);

const defs = {};

export {tiny, defs};

const line = defs.Line =
    class Line extends Shape {
        constructor() {
            super("position", "color");
            this.arrays.position = Vector3.cast(
                [0, 0, 0], [5, 0, 0]
            );
            this.arrays.color = [
                vec4(1, 0, 0, 1), vec4(1, 0, 0, 1)
            ];
            this.indices = false;
        }
    }