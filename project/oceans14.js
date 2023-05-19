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
            [-15, 0, 0], [15, 0, 0]
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

        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));
        // this.initial_camera_location = this.initial_camera_location.times(Mat4.rotation(-1*Math.PI/12, 1, 0, 0));
        //this.initial_camera_location = Mat4.look_at(vec3(1, 0, 0), vec3(0, 1, 0), vec3(0, 0, 1));
       // this.initial_camera_location = this.initial_camera_location.times(Mat4.translation(0, 70, 0));
        this.game_started = true;
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

    draw_laser(context, program_state, model_transform, t, rotating, location, left)
    {
        const gray = hex_color("#808080");

        // laser
        if (rotating === true) {
            // rotation angle- go from pi/1.5 to -pi/2 for laser on the right hand side of screen
            let sin_laser_1 = Math.sin(t / 2);

            // translate and draw laser
            if (left === false) {
                model_transform = model_transform.times(Mat4.translation(0, 0, 0));
                model_transform = model_transform.times(Mat4.translation(15, 0, 0));
                model_transform = model_transform.times(Mat4.rotation(sin_laser_1, 0, 0, 1));
                model_transform = model_transform.times(Mat4.translation(-15, 0, 0));
                this.shapes.line.draw(context, program_state, model_transform, this.materials.laser, "LINES");
                model_transform = Mat4.identity();
            }
            else // on the right side
            {

            }
        }
        else
        {
            this.shapes.line.draw(context, program_state, model_transform, this.materials.laser, "LINES");
        }



        // translate and draw laser box
        model_transform = model_transform.times(Mat4.translation(15.4, 0, 0));
        model_transform = model_transform.times(Mat4.scale(0.5, 0.3, 0.3));
        model_transform = model_transform.times(Mat4.rotation(-Math.PI / 2, 0, 1, 0));
        this.shapes.laser_box_2.draw(context, program_state, model_transform, this.materials.test.override({color: gray}));
        model_transform = Mat4.identity();

        model_transform = model_transform.times(Mat4.translation(16.2, 0, 0));
        model_transform = model_transform.times(Mat4.scale(0.7, 0.4, 0.4));
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
        // draw laser that's rotating
        let rotating = true;
        this.draw_laser(context, program_state, model_transform, t, true, 0, false);

        // draw laser that's flashing


    }


}

