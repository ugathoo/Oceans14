import {defs, tiny} from './examples/common.js';

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
        };

        // *** Materials
        this.materials = {
            test: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#808080")}),
            laser: new Material(new defs.Basic_Shader(),
                {ambient: 1, diffusivity: 1}), // ambient set to max to make laser nice and bright
            texture: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1.0, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("examples/assets/moonAndEarth.png", "NEAREST")
            }),
        };

        // original camera location
        // this.initial_camera_location = Mat4.look_at(vec3(0, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));

        // new camera location
        this.initial_camera_location = Mat4.identity();
        this.initial_camera_location = this.initial_camera_location.times(Mat4.translation(0, 0, -30));
        this.game_started = true;


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
        let head_transform = model_transform.times(Mat4.rotation(t, 0, 1, 0));
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





    draw_laser(context, program_state, model_transform, t, rotating, around, location, left)
    {
        const gray = hex_color("#808080");
        let translation_times = -1;
        if (left === false) {
            translation_times = 1;
        }
        if (rotating === true) {
            // translate and draw laser
            let laser_rot = Math.sin(t / 2);
            if (around === true) {
                laser_rot = t / 2;
            }
            // draw rotating laser
            model_transform = model_transform.times(Mat4.translation(0, location, 0));
            model_transform = model_transform.times(Mat4.translation(translation_times * 21.5, 0, 0));
            model_transform = model_transform.times(Mat4.rotation(laser_rot, 0, 0, 1));
            model_transform = model_transform.times(Mat4.translation(translation_times * -21.5, 0, 0));
            this.shapes.line.draw(context, program_state, model_transform, this.materials.laser, "LINES");
            model_transform = Mat4.identity();
        }
        else {
            // draw flashing laser
            model_transform = model_transform.times(Mat4.translation(0, location, 0));
            model_transform = model_transform.times(Mat4.translation(translation_times*21.5, 0, 0));
            model_transform = model_transform.times(Mat4.translation(translation_times*-21.5, 0, 0));
            if (Math.ceil(t) % 2 === 0)
                this.shapes.line.draw(context, program_state, model_transform, this.materials.laser, "LINES");
            model_transform = Mat4.identity();

        }

        // box for laser
        model_transform = model_transform.times(Mat4.translation(translation_times*21.6, location, 0));
        model_transform = model_transform.times(Mat4.scale(0.5, 0.3, 0.3));
        this.shapes.laser_box_2.draw(context, program_state, model_transform, this.materials.test.override({color: gray}));
        model_transform = Mat4.identity();

        model_transform = model_transform.times(Mat4.translation(translation_times*21.6, location, -1));
        model_transform = model_transform.times(Mat4.scale(0.6, 0.6, 0.6));
        this.shapes.cube.draw(context, program_state, model_transform, this.materials.test.override({color: gray}));
        model_transform = Mat4.identity();
    }
    //
    make_control_panel() {
        this.key_triggered_button("Start Game", ["r"], () => {
            if (this.game_started === false)
                this.game_started = true;
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
        let model_transform_background = Mat4.identity();
        let model_transform_laser = Mat4.identity();
        let model_transform_box1 = Mat4.identity();
        let model_transform_box2 = Mat4.identity();




        this.draw_drone(context, program_state, model_transform, t);
        model_transform = Mat4.identity();

        // draw the 3 lasers at random locations on screen
        this.draw_laser(context, program_state, model_transform, t, true, true, this.circle_laser_location, this.circle_laser_side);
        this.draw_laser(context, program_state, model_transform, t, true, false, this.rot_laser_location, this.rot_laser_side);
        this.draw_laser(context, program_state, model_transform, t, false, false, this.flash_laser_location, this.flash_laser_side);





    }


}

