import {defs, tiny} from './examples/common.js';
import {Text_Line} from './examples/text-demo.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Matrix, Mat4, Light, Shape, Material, Scene, Shader, Texture
} = tiny;

const {Cube, Axis_Arrows, Textured_Phong} = defs

export class Drone extends Shape {
    constructor(props) {
        super(props);
    }
}

class Line extends Shape {
    constructor() {
        super("position", "color");
        this.arrays.position = Vector3.cast(
            [-21.5, 0, 0], [21.5, 0, 0]
        );
        this.arrays.color = [
            vec4(0, 1, 0, 1), vec4(0, 1, 0, 1)
        ];
        this.indices = true; // not necessary
    }
}

class PyramidFace extends Shape{
    constructor() {
        super('position','normal');
        this.arrays.position = Vector3.cast(
            [1,0,0],[0,0,-1],[0,2,0],[0,0,-1],[-1,0,0],
            [0,2,0],[-1,0,0],[0,0,1],[0,2,0],[0,0,1],[1,0,0],
            [0,2,0],[0,0,1],[1,0,0],[0,0,-1],[-1,0,0],[0,0,1],[0,0,-1]
        );
        this.arrays.normal = Vector3.cast(
            [2,-2,1],[2,-2,1],[2,-2,1],
            [-2,-2,1],[-2,-2,1],[-2,-2,1],
            [-2,2,1],[-2,2,1],[-2,2,1],
            [2,2,1],[2,2,1],[2,2,1],
            [0,-1,0],[0,-1,0],[0,-1,0],
            [0,-1,0],[0,-1,0],[0,-1,0]
        );

        //this.indices.push(0,2,1);
    }
}

class NegPyramidFace extends Shape{
    constructor() {
        super('position','normal');
        this.arrays.position = Vector3.cast(
            [1,0,0],[0,0,-1],[0,-2,0],[0,0,-1],[-1,0,0],
            [0,-2,0],[-1,0,0],[0,0,1],[0,-2,0],[0,0,1],[1,0,0],
            [0,-2,0],[0,0,1],[1,0,0],[0,0,-1],[-1,0,0],[0,0,1],[0,0,-1]
        );
        this.arrays.normal = Vector3.cast(
            [2,-2,1],[2,-2,1],[2,-2,1],
            [-2,-2,1],[-2,-2,1],[-2,-2,1],
            [-2,2,1],[-2,2,1],[-2,2,1],
            [2,2,1],[2,2,1],[2,2,1],
            [0,-1,0],[0,-1,0],[0,-1,0],
            [0,-1,0],[0,-1,0],[0,-1,0]
        );

        //this.indices.push(0,2,1);
    }
}
export class Oceans14 extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();
        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            torus: new defs.Torus(15, 15),
            torus2: new defs.Torus(3, 15),
            head: new defs.Subdivision_Sphere(4),
            circle: new defs.Regular_2D_Polygon(1, 15),
            line: new Line(),
            square: new defs.Square(),
            laser_box: new defs.Subdivision_Sphere(4),
            laser_box_2: new defs.Rounded_Capped_Cylinder(30, 30, [0, 1]),
            cube: new defs.Cube(),
            leg: new defs.Cube(),
            //blade: new defs.Windmill(3),
            nut: new defs.Subdivision_Sphere(1),
            blade: new PyramidFace(),
            gem_half1: new PyramidFace(),
            gem_half2: new NegPyramidFace(),
            text: new Text_Line(35),
        };

        const texture = new defs.Textured_Phong(1);

        // *** Materials
        this.materials = {
            test: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#808080")}),
            laser: new Material(new defs.Basic_Shader(),
                {ambient: 1, diffusivity: 1}), // ambient set to max to make laser nice and bright
            texture: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1.0, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("examples/assets/zpos.png", "NEAREST")
            }),

            text_image: new Material(new Textured_Phong(1), {
                ambient: 1, diffusivity: 0, specularity: 0,
                texture: new Texture("examples/assets/text.png")
            }),

            // metallic_laser_box: new Material(new Textured_Phong(), {
            //     ambient: 0.9, diffusivity: 1, specularity: 0,
            //     texture: new Texture("examples/assets/metallic2.png")
            // }),
            tutorial_box: new Material(new Textured_Phong(), {
                ambient: 1, diffusivity: 0, specularity: 0,
                texture: new Texture("examples/assets/Blue_Big_Tile.png")
            }),
        }

        // original camera location
        // this.initial_camera_location = Mat4.look_at(vec3(0, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));

        // new camera location
        this.initial_camera_location = Mat4.identity();
        this.initial_camera_location = this.initial_camera_location.times(Mat4.translation(0, 0, -30));
        this.game_started = false;
        this.medium = false;
        this.hard = false;

        this.tutorial = false;
        this.tutorial_steps = 0; // incremented from 0-5 for tutorial

        this.drone_model_transform = Mat4.identity();


        // get random values for lasers
        // random value between 8 and -8 for y-axis location of laser box/laser -> but make sure they are at least 4 units away from each other
         let random_amount = Math.random();
         this.circle_laser_location = (-8. * random_amount) + (8. * (1. - random_amount));

         random_amount = Math.random();
         let linear_combo = (-8. * random_amount) + (8. * (1. - random_amount));
         while (Math.abs(linear_combo - this.circle_laser_location) < 4.)
         {
             random_amount = Math.random();
             linear_combo = (-8. * random_amount) + (8. * (1. - random_amount));
         }
         this.rot_laser_location = linear_combo;

         random_amount = Math.random();
         linear_combo = (-8. * random_amount) + (8. * (1. - random_amount));
         while (Math.abs(linear_combo - this.circle_laser_location) < 4. || Math.abs(linear_combo - this.rot_laser_location) < 4.)
        {
            random_amount = Math.random();
            linear_combo = (-8. * random_amount) + (8. * (1. - random_amount));
        }
        this.flash_laser_location = linear_combo;

        // get random value for left or right for each laser
        random_amount = Math.random();
        if (random_amount > 0.5)
            this.circle_laser_side = true;
        else
            this.circle_laser_side = false;

        random_amount = Math.random();
        if (random_amount > 0.5)
            this.rot_laser_side = true;
        else
            this.rot_laser_side = false;

        if (this.circle_laser_side === true && this.rot_laser_side === true)
            this.flash_laser_side = false;
        else if (this.circle_laser_side === false && this.rot_laser_side === false)
            this.flash_laser_side = true;
        else {
            random_amount = Math.random();
            if (random_amount > 0.5)
                this.flash_laser_side = true;
            else
                this.flash_laser_side = false;
        }

    }

    draw_drone(context, program_state, model_transform, t) {
        const pink = hex_color("#ed99f0");
        let head_transform = model_transform.times(Mat4.translation(-17,10,0)).times(Mat4.rotation(t, 0, 1, 0));
        this.shapes.head.draw(context, program_state, head_transform, this.materials.test.override({color: pink}));
        let leg_transform1 = head_transform.times(Mat4.scale(1.3, 0.2, 0.2)).times(Mat4.translation(1.25, 0, 0));
        let leg_transform2 = head_transform.times(Mat4.scale(1.3, 0.2, 0.2)).times(Mat4.translation(-1.25, 0, 0));
        this.shapes.leg.draw(context, program_state, leg_transform1, this.materials.test);
        this.shapes.leg.draw(context, program_state, leg_transform2, this.materials.test);
        let k1_transform = leg_transform1.times(Mat4.scale((1 / 1.3), (1 / 0.2), (1 / 0.2))).times(Mat4.scale(0.2, 0.2, 0.2)).times(Mat4.translation(5.25, 1.7, 0));
        this.shapes.nut.draw(context, program_state, k1_transform, this.materials.test);
        let b1_transform = leg_transform1.times(Mat4.scale((1 / 1.3), (1 / 0.2), (1 / 0.2))).times(Mat4.rotation(-90, 1, 1, 1))
            .times(Mat4.scale(0.1, 0.6, 0.1)).times(Mat4.translation(0, 1.9, 3));
        let b2_transform = leg_transform1.times(Mat4.scale((1 / 1.3), (1 / 0.2), (1 / 0.2))).times(Mat4.rotation(-180, 1, 1, 1))
            .times(Mat4.scale(0.1, 0.6, 0.1)).times(Mat4.translation(3.3, 0.2, 10.5));
        let b3_transform = leg_transform1.times(Mat4.scale((1 / 1.3), (1 / 0.2), (1 / 0.2))).times(Mat4.rotation(180, 1, 1, 1))
            .times(Mat4.rotation(90, 0, 0, 1)).times(Mat4.rotation(-90, 0, 1, 0))
            .times(Mat4.scale(0.1, 0.6, 0.1)).times(Mat4.translation(-0.5, -0.5, -10));
        this.shapes.blade.draw(context, program_state, b1_transform, this.materials.test.override({color: pink}));
        this.shapes.blade.draw(context, program_state, b2_transform, this.materials.test.override({color: pink}));
        this.shapes.blade.draw(context, program_state, b3_transform, this.materials.test.override({color: pink}));
        let k2_transform = leg_transform2.times(Mat4.scale((1 / 1.3), (1 / 0.2), (1 / 0.2))).times(Mat4.scale(0.2, 0.2, 0.2))
            .times(Mat4.translation(-5.25, 1.7, 0));
        this.shapes.nut.draw(context, program_state, k2_transform, this.materials.test);

        let b4_transform = leg_transform2.times(Mat4.scale((1 / 1.3), (1 / 0.2), (1 / 0.2))).times(Mat4.rotation(90, 1, 1, 1))
            .times(Mat4.rotation(200, 1, 0, 0))
            .times(Mat4.scale(0.1, 0.6, 0.1)).times(Mat4.translation(2.1, 1.6, -4.2));

        let b5_transform = leg_transform2.times(Mat4.scale((1 / 1.3), (1 / 0.2), (1 / 0.2))).times(Mat4.rotation(-180, 1, 1, 1))
            .times(Mat4.rotation(-280, 1, 0, 0))
            .times(Mat4.scale(0.1, 0.6, 0.1)).times(Mat4.translation(3.3, -0.5, 10.5));

        let b6_transform = leg_transform2.times(Mat4.scale((1 / 1.3), (1 / 0.2), (1 / 0.2))).times(Mat4.rotation(180, 1, 1, 1))
            .times(Mat4.rotation(90, 1, 1, 0)).times(Mat4.rotation(-45, 0, 0, 1))
            .times(Mat4.scale(0.1, 0.6, 0.1)).times(Mat4.translation(-5, -1.1, 5.5));
        this.shapes.blade.draw(context, program_state, b4_transform, this.materials.test.override({color: pink}));
        this.shapes.blade.draw(context, program_state, b5_transform, this.materials.test.override({color: pink}));
        this.shapes.blade.draw(context, program_state, b6_transform, this.materials.test.override({color: pink}));

    }


    draw_jewel(context, program_state, model_transform, t){
        const red = hex_color('#FF0000');
        let gem_transform = model_transform.times(Mat4.translation(0,-9.3,0)).times(Mat4.scale(0.5,0.5,0.5)).times(Mat4.rotation(t,0,1,0));
        this.shapes.gem_half1.draw(context,program_state,gem_transform,this.materials.test.override({color:red}));
        let gem2_transform = model_transform.times(Mat4.translation(0,-9.3,0)).times(Mat4.scale(0.5,0.5,0.5)).times(Mat4.rotation(t,0,1,0));
        this.shapes.gem_half2.draw(context,program_state,gem2_transform,this.materials.test.override({color:red}));
    }//.times(Mat4.rotation(-135,0,0,1))


    draw_laser(context, program_state, model_transform, t, rotating, around, location, left, tutorial) // make it so that laser can't go super high up
    {
        let laser_rot = 0;
        let back = 0;
        const gray = hex_color("#808080");
        let translation_times = -1;
        if (left === false) {
            translation_times = 1;
        }
        if (rotating === true) {
            // translate and draw laser
            if (left === true) {
                laser_rot = Math.sin(t / 2) - Math.PI / 3.1;
                if (tutorial === true)
                    laser_rot = Math.sin(2) - Math.PI /1.6;
            }
            else {
                laser_rot = Math.sin(t / 2) + Math.PI / 3.1;
                if (tutorial === true)
                    laser_rot = Math.sin(2) + Math.PI / 3;
            }
            if (around === true && left === true) {
                //laser_rot = Math.sin(t / 2)/4 - Math.PI/13;
                laser_rot = Math.sin(t/1.2) - Math.PI/3.1;
                if (tutorial === true)
                    laser_rot = Math.sin(2) - Math.PI /1.6;
            }
            if (around === true && left === false) {
                //laser_rot = Math.sin(t / 2)/4 + Math.PI/13;
                laser_rot = Math.sin(t/1.2) + Math.PI/3.1;
                if (tutorial === true)
                    laser_rot = Math.sin(2) + Math.PI / 3;
            }
            // draw rotating laser
            model_transform = model_transform.times(Mat4.translation(0, location, back));
            model_transform = model_transform.times(Mat4.translation(translation_times * 21.5, 0, 0));
            model_transform = model_transform.times(Mat4.rotation(laser_rot, 0, 0, 1));
            model_transform = model_transform.times(Mat4.translation(translation_times * -21.5, 0, 0));
            this.shapes.line.draw(context, program_state, model_transform, this.materials.laser, "LINES");
            model_transform = Mat4.identity();
        }
        else {
            // draw flashing laser
            model_transform = model_transform.times(Mat4.translation(0, location, back));
            model_transform = model_transform.times(Mat4.translation(translation_times*21.5, 0, 0));
            model_transform = model_transform.times(Mat4.translation(translation_times*-21.5, 0, 0));
            if (Math.ceil(t) % 2 === 0 && tutorial === false)
                this.shapes.line.draw(context, program_state, model_transform, this.materials.laser, "LINES");
            model_transform = Mat4.identity();

        }

        // box for laser
        model_transform = model_transform.times(Mat4.translation(translation_times*21.6, location, back));
        model_transform = model_transform.times(Mat4.scale(0.5, 0.3, 0.3));
        this.shapes.laser_box_2.draw(context, program_state, model_transform, this.materials.test.override({color: gray}));
       // this.shapes.laser_box_2.draw(context, program_state, model_transform, this.materials.test.override({color: gray}));
        model_transform = Mat4.identity();

        model_transform = model_transform.times(Mat4.translation(translation_times*21.6, location, -1 + back));
        model_transform = model_transform.times(Mat4.scale(0.6, 0.6, 0.6));
        this.shapes.cube.draw(context, program_state, model_transform, this.materials.test.override({color: gray}));
        model_transform = Mat4.identity();

        return laser_rot;
    }

    tutorial_step_0(context, program_state, model_transform) {
        model_transform = Mat4.identity();
        // create box
        model_transform = model_transform.times(Mat4.scale(9, 9, 9));
        this.shapes.square.draw(context, program_state, model_transform, this.materials.tutorial_box);
        // add text to box
        model_transform = Mat4.identity();
        model_transform = model_transform.times(Mat4.scale(0.5, 0.5, 1));
        model_transform = model_transform.times(Mat4.translation(-7, 7.7, 5));
        this.shapes.text.set_string("Welcome to", context.context);
        this.shapes.text.draw(context, program_state, model_transform, this.materials.text_image);
        model_transform = model_transform.times(Mat4.translation(0.15, -3, 0));
        this.shapes.text.set_string("Oceans 14!", context.context);
        this.shapes.text.draw(context, program_state, model_transform, this.materials.text_image);
        model_transform = model_transform.times(Mat4.scale(0.8, 0.8, 1));
        model_transform = model_transform.times(Mat4.translation(1.8, -5.3, 0));
        this.shapes.text.set_string("Objective:", context.context);
        this.shapes.text.draw(context, program_state, model_transform, this.materials.text_image);
        model_transform = model_transform.times(Mat4.translation(-6.8, -2.5, 0));
        this.shapes.text.set_string("Capture Jewel using", context.context);
        this.shapes.text.draw(context, program_state, model_transform, this.materials.text_image);
        model_transform = model_transform.times(Mat4.translation(5.5, -2.5, 0));
        this.shapes.text.set_string("drone while", context.context);
        this.shapes.text.draw(context, program_state, model_transform, this.materials.text_image);
        model_transform = model_transform.times(Mat4.translation(-2, -2.5, 0));
        this.shapes.text.set_string("dodging lasers", context.context);
        this.shapes.text.draw(context, program_state, model_transform, this.materials.text_image);
        model_transform = model_transform.times(Mat4.scale(0.7, 0.7, 1));
        model_transform = model_transform.times(Mat4.translation(0, -9.3, 0));
        this.shapes.text.set_string("press n to continue", context.context);
        this.shapes.text.draw(context, program_state, model_transform, this.materials.text_image);
        model_transform = Mat4.identity();
    }

    tutorial_step_1(context, program_state, model_transform) {
        // create box
        model_transform = model_transform.times(Mat4.scale(9, 9, 9));
        this.shapes.square.draw(context, program_state, model_transform, this.materials.tutorial_box);
        // add text to box
        model_transform = Mat4.identity();
        model_transform = model_transform.times(Mat4.scale(0.7, 0.7, 1));
        model_transform = model_transform.times(Mat4.translation(-3.7, 5.7, 5));
        this.shapes.text.set_string("BEWARE:", context.context);
        this.shapes.text.draw(context, program_state, model_transform, this.materials.text_image);
        model_transform = model_transform.times(Mat4.scale(0.75, 0.75, 1));
        model_transform = model_transform.times(Mat4.translation(-4.5, -4, 0));
        this.shapes.text.set_string("lasers rotate", context.context);
        this.shapes.text.draw(context, program_state, model_transform, this.materials.text_image);
        model_transform = model_transform.times(Mat4.translation(5, -4, 0));
        this.shapes.text.set_string("and may", context.context);
        this.shapes.text.draw(context, program_state, model_transform, this.materials.text_image);
        model_transform = model_transform.times(Mat4.translation(-2.8, -4, 0));
        this.shapes.text.set_string("also flash!", context.context);
        this.shapes.text.draw(context, program_state, model_transform, this.materials.text_image);
        model_transform = model_transform.times(Mat4.scale(0.65, 0.65, 1));
        model_transform = model_transform.times(Mat4.translation(-2, -8.5, 0));
        this.shapes.text.set_string("press n to continue", context.context);
        this.shapes.text.draw(context, program_state, model_transform, this.materials.text_image);
        model_transform = Mat4.identity();
    }

    tutorial_step_2(context, program_state, model_transform) {
        // draw box
        model_transform = Mat4.identity();
        model_transform = model_transform.times(Mat4.scale(5, 5, 5));
        model_transform = model_transform.times(Mat4.translation(-1.35, 1.3, 0));
        this.shapes.square.draw(context, program_state, model_transform, this.materials.tutorial_box);

        // draw text
        model_transform = Mat4.identity();
        model_transform = model_transform.times(Mat4.scale(0.38, 0.38, 1));
        model_transform = model_transform.times(Mat4.translation(-20.5, 19.7, 5));
        this.shapes.text.set_string("navigate", context.context);
        this.shapes.text.draw(context, program_state, model_transform, this.materials.text_image);
        model_transform = model_transform.times(Mat4.translation(-2, -4.5, 0));
        this.shapes.text.set_string("drone using", context.context);
        this.shapes.text.draw(context, program_state, model_transform, this.materials.text_image);
        model_transform = model_transform.times(Mat4.translation(1.7, -4.5, 0));
        this.shapes.text.set_string("WASD keys", context.context);
        this.shapes.text.draw(context, program_state, model_transform, this.materials.text_image);
        model_transform = model_transform.times(Mat4.scale(0.6, 0.6, 1));
        model_transform = model_transform.times(Mat4.translation(-3.4, -6.4, 0));
        this.shapes.text.set_string("press n to continue", context.context);
        this.shapes.text.draw(context, program_state, model_transform, this.materials.text_image);
        model_transform = Mat4.identity();
    }

    tutorial_step_3(context, program_state, model_transform) {
        // draw box
        model_transform = Mat4.identity();
        model_transform = model_transform.times(Mat4.scale(5, 5, 5));
        model_transform = model_transform.times(Mat4.translation(1.35, -1.3, 0));
        this.shapes.square.draw(context, program_state, model_transform, this.materials.tutorial_box);

        // draw text
        model_transform = Mat4.identity();
        model_transform = model_transform.times(Mat4.scale(.38, 0.38, 1));
        model_transform = model_transform.times(Mat4.translation(6.5, -8.7, 5));
        this.shapes.text.set_string("win the game", context.context);
        this.shapes.text.draw(context, program_state, model_transform, this.materials.text_image);
        model_transform = model_transform.times(Mat4.translation(0, -4.5, 0));
        this.shapes.text.set_string("by colliding", context.context);
        this.shapes.text.draw(context, program_state, model_transform, this.materials.text_image);
        model_transform = model_transform.times(Mat4.translation(1.3, -4.5, 0));
        this.shapes.text.set_string("with jewel", context.context);
        this.shapes.text.draw(context, program_state, model_transform, this.materials.text_image);
        model_transform = model_transform.times(Mat4.scale(0.6, 0.6, 1));
        model_transform = model_transform.times(Mat4.translation(-2.5, -6.4, 0));
        this.shapes.text.set_string("press n to continue", context.context);
        this.shapes.text.draw(context, program_state, model_transform, this.materials.text_image);
        model_transform = Mat4.identity();
    }

    tutorial_step_4(context, program_state, model_transform) {
        // draw box
        model_transform = Mat4.identity();
        model_transform = model_transform.times(Mat4.scale(5, 5, 5));
        model_transform = model_transform.times(Mat4.translation(-2.8, -1.3, 0));
        this.shapes.square.draw(context, program_state, model_transform, this.materials.tutorial_box);

        // draw text
        model_transform = Mat4.identity();
        model_transform = model_transform.times(Mat4.scale(.34, 0.34, 1));
        model_transform = model_transform.times(Mat4.translation(-43.4, -9.2, 5));
        this.shapes.text.set_string("too easy? too", context.context);
        this.shapes.text.draw(context, program_state, model_transform, this.materials.text_image);
        model_transform = model_transform.times(Mat4.translation(0.8, -4.5, 0));
        this.shapes.text.set_string("hard? change", context.context);
        this.shapes.text.draw(context, program_state, model_transform, this.materials.text_image);
        model_transform = model_transform.times(Mat4.translation(1.1, -4.5, 0));
        this.shapes.text.set_string("mode below", context.context);
        this.shapes.text.draw(context, program_state, model_transform, this.materials.text_image);
        model_transform = model_transform.times(Mat4.scale(0.6, 0.6, 1));
        model_transform = model_transform.times(Mat4.translation(-1.5, -8.9, 0));
        this.shapes.text.set_string("press n to continue", context.context);
        this.shapes.text.draw(context, program_state, model_transform, this.materials.text_image);
        model_transform = Mat4.identity();
    }

    tutorial_step_5(context, program_state, model_transform) {
        // create box
        model_transform = model_transform.times(Mat4.scale(9, 9, 9));
        this.shapes.square.draw(context, program_state, model_transform, this.materials.tutorial_box);

        // add text to box
        model_transform = Mat4.identity();
        model_transform = model_transform.times(Mat4.scale(0.5, 0.5, 1));
        model_transform = model_transform.times(Mat4.translation(-8, 10.2, 5));
        this.shapes.text.set_string("when you're", context.context);
        this.shapes.text.draw(context, program_state, model_transform, this.materials.text_image);
        model_transform = model_transform.times(Mat4.translation(-2, -3, 0));
        this.shapes.text.set_string("ready, press r", context.context);
        this.shapes.text.draw(context, program_state, model_transform, this.materials.text_image);
        model_transform = model_transform.times(Mat4.translation(2.1, -3, 0));
        this.shapes.text.set_string("to begin or", context.context);
        this.shapes.text.draw(context, program_state, model_transform, this.materials.text_image);
        model_transform = model_transform.times(Mat4.translation(0, -3, 0));
        this.shapes.text.set_string("t to return", context.context);
        this.shapes.text.draw(context, program_state, model_transform, this.materials.text_image);
        model_transform = model_transform.times(Mat4.translation(-2.2, -3, 0));
        this.shapes.text.set_string("to home screen", context.context);
        this.shapes.text.draw(context, program_state, model_transform, this.materials.text_image);
        model_transform = model_transform.times(Mat4.scale(1.3, 1.3, 1));
        model_transform = model_transform.times(Mat4.translation(2, -3.7, 0));
        this.shapes.text.set_string("GOOD LUCK", context.context);
        this.shapes.text.draw(context, program_state, model_transform, this.materials.text_image);
        model_transform = model_transform.times(Mat4.scale(0.4, 0.4, 1));
        model_transform = model_transform.times(Mat4.translation(5, -9.3, 0));
        this.shapes.text.set_string("press r or t", context.context);
        this.shapes.text.draw(context, program_state, model_transform, this.materials.text_image);
        model_transform = Mat4.identity();
    }


    //
    make_control_panel() {
        this.key_triggered_button("Start Game", ["r"], () => {
            if (this.game_started === false)
                this.game_started = true;
            this.tutorial = false;
        });
        this.key_triggered_button("Easy Mode", ["e"], () => {
            this.medium = false;
            this.hard = false;
        });
        this.key_triggered_button("Medium Mode", ["m"], () => {
            this.medium = true;
            this.hard = false;
        });
        this.key_triggered_button("Hard Mode", ["h"], () => {
            this.medium = false;
            this.hard = true;
        });
        this.key_triggered_button("Move Up", ["w"], () => {
            this.drone_model_transform = this.drone_model_transform.times(Mat4.translation(0, 1, 0));
            console.log(this.drone_model_transform - Mat4.identity());
        });
        this.key_triggered_button("Move Left", ["a"], () => {
            this.drone_model_transform = this.drone_model_transform.times(Mat4.translation(-1, 0, 0));
        });
        this.key_triggered_button("Move Right", ["d"], () => {
            this.drone_model_transform = this.drone_model_transform.times(Mat4.translation(1, 0, 0));
        });
        this.key_triggered_button("Move Down", ["s"], () => {
            this.drone_model_transform = this.drone_model_transform.times(Mat4.translation(0, -1, 0));
        });
        this.key_triggered_button("Start/End tutorial", ["t"], () => {
            this.tutorial = !this.tutorial;
            this.tutorial_steps = 0;
            this.game_started = false;
            this.drone_model_transform = Mat4.identity(); // reset drone to og location in case tutorial was pulled up mid game
        });
        this.key_triggered_button("Next", ["n"], () => {
            this.tutorial_steps = this.tutorial_steps + 1;
            if (this.tutorial_steps > 5)
                this.tutorial = false;
        });
    }

    display(context, program_state) {
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(this.initial_camera_location);
        }
        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000
        );
        const light_position = vec4(0, 5, 5, 1);
        // // The parameters of the Light are: position, color, size
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];


        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        let model_transform = Mat4.identity();



        // draw background
        model_transform = model_transform.times(Mat4.scale(450, 450, 450));
        model_transform = model_transform.times(Mat4.translation(0, 0, -1.2));
        this.shapes.square.draw(context, program_state, model_transform, this.materials.texture);
        model_transform = Mat4.identity();

        if (this.game_started) {
            program_state.set_camera(Mat4.identity().times(Mat4.translation(0, 0, -30)));

            model_transform = Mat4.identity();
            let pedestal = model_transform.times(Mat4.translation(0,-12,0));
            this.shapes.cube.draw(context,program_state,pedestal,this.materials.test);
            model_transform = Mat4.identity();
            this.draw_jewel(context,program_state,model_transform,t);
            //let drone_trans = model_transform;
            this.draw_drone(context, program_state, this.drone_model_transform, t);


            model_transform = Mat4.identity();
            // draw the 3 lasers at random locations on screen
            this.draw_laser(context, program_state, model_transform, t, true, true, this.circle_laser_location, this.circle_laser_side, false);
            if (this.medium === true || this.hard === true)
                this.draw_laser(context, program_state, model_transform, t, true, false, this.rot_laser_location, this.rot_laser_side, false);
            if (this.hard === true)
                this.draw_laser(context, program_state, model_transform, t, false, false, this.flash_laser_location, this.flash_laser_side, false);

        }
        else if (this.tutorial === true)
        {
            // setup board like above
            program_state.set_camera(Mat4.identity().times(Mat4.translation(0, 0, -30)));

            model_transform = Mat4.identity();
            let pedestal = model_transform.times(Mat4.translation(0,-12,0));
            this.shapes.cube.draw(context,program_state,pedestal,this.materials.test);
            model_transform = Mat4.identity();
            this.draw_jewel(context,program_state,model_transform,t);
            //let drone_trans = model_transform;
            this.draw_drone(context, program_state, this.drone_model_transform, t);


            model_transform = Mat4.identity();
            // draw the 3 lasers at random locations on screen
            this.draw_laser(context, program_state, model_transform, t, true, true, this.circle_laser_location, this.circle_laser_side, true);
            if (this.medium === true || this.hard === true)
                this.draw_laser(context, program_state, model_transform, t, true, false, this.rot_laser_location, this.rot_laser_side, true);
            if (this.hard === true)
                this.draw_laser(context, program_state, model_transform, t, false, false, this.flash_laser_location, this.flash_laser_side, true);

            model_transform = Mat4.identity();
            // add in tutorial steps!
            if (this.tutorial_steps === 0)
                this.tutorial_step_0(context, program_state, model_transform);
            if (this.tutorial_steps === 1)
                this.tutorial_step_1(context, program_state, model_transform);
            if (this.tutorial_steps === 2)
                this.tutorial_step_2(context, program_state, model_transform);
            if (this.tutorial_steps === 3)
                this.tutorial_step_3(context, program_state, model_transform);
            if (this.tutorial_steps === 4)
                this.tutorial_step_4(context, program_state, model_transform);
            if (this.tutorial_steps === 5)
                this.tutorial_step_5(context, program_state, model_transform);

        }
        else // pre-game screen
        {
            model_transform = Mat4.identity();
            model_transform = model_transform.times(Mat4.rotation(t, 0, 1, 0));
            model_transform = model_transform.times(Mat4.scale(1.5, 1.5, 1));
            model_transform = model_transform.times(Mat4.translation(-6, 0, -1.1));

           //
            this.shapes.text.set_string("Oceans 14", context.context);
           this.shapes.text.draw(context, program_state, model_transform, this.materials.text_image);
           // this.shapes.square.draw(context, program_state, model_transform.times(Mat4.scale(2, 2, .50)), this.materials.credit_square);

            model_transform = Mat4.identity();
            model_transform = model_transform.times(Mat4.scale(0.5, 0.5, 1));
            model_transform = model_transform.times(Mat4.translation(-42.7, -14.5, -1.1));
            this.shapes.text.set_string("Press r to begin", context.context);
            this.shapes.text.draw(context, program_state, model_transform, this.materials.text_image);

            model_transform = Mat4.identity();
            model_transform = model_transform.times(Mat4.scale(0.5, 0.5, 1));
            model_transform = model_transform.times(Mat4.translation(-42.7, -18.6, -1.1));
            this.shapes.text.set_string("Press t for tutorial", context.context);
            this.shapes.text.draw(context, program_state, model_transform, this.materials.text_image);

            model_transform = Mat4.identity();
            model_transform = model_transform.times(Mat4.scale(0.5, 0.5, 1));
            model_transform = model_transform.times(Mat4.translation(-42.7, -22.5, -1.1));
            this.shapes.text.set_string("Choose mode: easy (e) medium (m)", context.context);
            this.shapes.text.draw(context, program_state, model_transform, this.materials.text_image);

            model_transform = model_transform.times(Mat4.translation(49, 0, 0));
            this.shapes.text.set_string("hard (h)", context.context);
            this.shapes.text.draw(context, program_state, model_transform, this.materials.text_image);


            model_transform = Mat4.identity();
            model_transform = model_transform.times(Mat4.rotation(Math.PI/6, 0, 0, 1));
            model_transform = model_transform.times(Mat4.scale(2, 2, 2));
            model_transform = model_transform.times(Mat4.translation(13, -4.5, 0));
            this.draw_drone(context, program_state, model_transform, t);

            model_transform = Mat4.identity();
            model_transform = model_transform.times(Mat4.scale(3, 3, 3));
            model_transform = model_transform.times(Mat4.translation(5, 7, 0));
            this.draw_jewel(context,program_state,model_transform,t);


        }



    }


}

