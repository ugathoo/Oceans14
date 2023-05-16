import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Matrix, Mat4, Light, Shape, Material, Scene, Shader, Texture
} = tiny;

const {Cube, Axis_Arrows, Textured_Phong} = defs

export class Drone extends Shape {
    constructor(props) {
        super(props);

        this.shapes = {
            head: new defs.Subdivided_Sphere(4),
            leg: new Cube(),

        }
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

class LaserBox extends Shape {

}


export class Oceans14 extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();
        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            torus: new defs.Torus(15, 15),
            torus2: new defs.Torus(3, 15),
            sphere: new defs.Subdivision_Sphere(4),
            circle: new defs.Regular_2D_Polygon(1, 15),
            line: new Line(),
            square: new defs.Square(),
            laser_box: new defs.Subdivision_Sphere(4),
        };

        // *** Materials
        this.materials = {
            test: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
            laser: new Material(new defs.Basic_Shader(),
                {ambient: 1, diffusivity: 1}), // ambient set to max to make laser nice and bright
            texture: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1.0, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("examples/assets/moonAndEarth.png", "NEAREST")
            }),
        }
        // rotated camera to see between lasers better
        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));
       // this.initial_camera_location = this.initial_camera_location.times(Mat4.rotation(-1*Math.PI/12, 1, 0, 0));



        this.game_started = true;
        // generate info about lasers for the game
        this.laser_1_location = Math.random();
        this.laser_1_max_angle = Math.random();
        this.laser_2_location = Math.random();
        this.laser_2_max_angle = Math.random();




    }
    //
     make_control_panel() {
    //     // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
     //    this.key_triggered_button("Start Game", ["r"], () => this.attached = () => null);
    //     this.new_line();
    //     this.key_triggered_button("Attach to planet 1", ["Control", "1"], () => this.attached = () => this.planet_1);
    //     this.key_triggered_button("Attach to planet 2", ["Control", "2"], () => this.attached = () => this.planet_2);
    //     this.new_line();
    //     this.key_triggered_button("Attach to planet 3", ["Control", "3"], () => this.attached = () => this.planet_3);
    //     this.key_triggered_button("Attach to planet 4", ["Control", "4"], () => this.attached = () => this.planet_4);
    //     this.new_line();
    //     this.key_triggered_button("Attach to moon", ["Control", "m"], () => this.attached = () => this.moon);
         this.key_triggered_button("Start Game", ["r"], () => {
             if (this.game_started === false)
                 this.game_started = true;
         });
     }

    display_lasers(t) {

    }

    display(context, program_state) {
        // display():  Called once per frame of animation.
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
            // Home screen
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(this.initial_camera_location);
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);

        // TODO: Lighting (Requirement 2)
        const light_position = vec4(0, 5, 5, 1);
        // The parameters of the Light are: position, color, size
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        const t_seconds = program_state.animation_time;
        const yellow = hex_color("#fac91a");
        let model_transform = Mat4.identity();
        let model_transform_background = Mat4.identity();
        let model_transform_lasers = Mat4.identity();
        let model_transform_laser_box = Mat4.identity();



        if (this.game_started === false)
        {
            // display a loading screen




        }
        else
        {

            // setup lasers
            // 2 lasers at random spots along sides of view-one on each side, and random spots must be "near" middle?
            // will be "coming out" of laser generator devices
            // u have to dodge the 2 lasers
            // maybe we could have an easy/medium/hard mode that decides the
            // speeds of the lasers/number of lasers and length of lasers?




            // rotation angle- go from pi/1.5 to -pi/2 for laser on the right hand side of screen
            let sin_laser_1 =  Math.sin(t);


            // // make laser move towards you
            model_transform_lasers = model_transform_lasers.times(Mat4.translation(15, 0, 0));
            model_transform_lasers = model_transform_lasers.times(Mat4.rotation(sin_laser_1, 0, 0, 1));
            model_transform_lasers = model_transform_lasers.times(Mat4.translation(-15, 0, 0));
            this.shapes.line.draw(context, program_state, model_transform_lasers, this.materials.laser, "LINES");

            model_transform_laser_box = model_transform_laser_box.times(Mat4.translation(16, 0, 0));
            model_transform_laser_box = model_transform_laser_box.times(Mat4.scale(0.8, 0.8, 0.8));
            this.shapes.laser_box.draw(context, program_state, model_transform_laser_box, this.materials.test.override({color: yellow}));
            model_transform = model_transform.times(Mat4.translation(0, -2, 0));



        }

    }
}

