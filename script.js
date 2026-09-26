import * as THREE from
"https://unpkg.com/three@0.170.0/build/three.module.js";


/* =========================================================
   HEKSAA
   CINEMATIC HIMALAYAN TERRAIN
   VERSION 3
========================================================= */

const canvas =
    document.getElementById("three-canvas");


/* =========================================================
   SCENE
========================================================= */

const scene =
    new THREE.Scene();


scene.background =
    new THREE.Color(0x07111a);


scene.fog =
    new THREE.FogExp2(
        0x70818b,
        0.010
    );


/* =========================================================
   CAMERA
========================================================= */

const camera =
    new THREE.PerspectiveCamera(
        55,
        window.innerWidth /
        window.innerHeight,
        0.1,
        500
    );


camera.position.set(
    0,
    5,
    22
);


/* =========================================================
   RENDERER
========================================================= */

const renderer =
    new THREE.WebGLRenderer({

        canvas: canvas,

        antialias: true,

        powerPreference:
            "high-performance"

    });


renderer.setSize(
    window.innerWidth,
    window.innerHeight
);


renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        2
    )
);


renderer.outputColorSpace =
    THREE.SRGBColorSpace;


renderer.toneMapping =
    THREE.ACESFilmicToneMapping;


renderer.toneMappingExposure =
    1.15;


/* =========================================================
   LIGHTING
========================================================= */

const skyLight =
    new THREE.HemisphereLight(
        0xbdd5e8,
        0x18221f,
        2.1
    );


scene.add(
    skyLight
);


const sun =
    new THREE.DirectionalLight(
        0xffdfb1,
        4.5
    );


sun.position.set(
    -30,
    40,
    15
);


scene.add(
    sun
);


/* =========================================================
   SKY DOME
========================================================= */

const skyGeometry =
    new THREE.SphereGeometry(
        160,
        48,
        32
    );


const skyMaterial =
    new THREE.ShaderMaterial({

        side:
            THREE.BackSide,

        uniforms: {

            top:
            {
                value:
                    new THREE.Color(
                        0x061525
                    )
            },

            middle:
            {
                value:
                    new THREE.Color(
                        0x315064
                    )
            },

            horizon:
            {
                value:
                    new THREE.Color(
                        0xc3b9a7
                    )
            }

        },


        vertexShader: `

            varying vec3 vPos;

            void main() {

                vec4 world =
                    modelMatrix *
                    vec4(
                        position,
                        1.0
                    );

                vPos =
                    world.xyz;

                gl_Position =
                    projectionMatrix *
                    modelViewMatrix *
                    vec4(
                        position,
                        1.0
                    );

            }

        `,


        fragmentShader: `

            uniform vec3 top;
            uniform vec3 middle;
            uniform vec3 horizon;

            varying vec3 vPos;

            void main() {

                float h =
                    normalize(vPos).y;

                vec3 color;

                if(h > 0.08) {

                    color =
                        mix(
                            middle,
                            top,
                            smoothstep(
                                0.08,
                                0.82,
                                h
                            )
                        );

                } else {

                    color =
                        mix(
                            horizon,
                            middle,
                            smoothstep(
                                -0.20,
                                0.08,
                                h
                            )
                        );

                }

                gl_FragColor =
                    vec4(
                        color,
                        1.0
                    );

            }

        `

    });


scene.add(
    new THREE.Mesh(
        skyGeometry,
        skyMaterial
    )
);


/* =========================================================
   SEEDED RANDOM
========================================================= */

function randomNoise(
    x,
    z
) {

    return (
        Math.sin(
            x * 12.9898 +
            z * 78.233
        ) *
        43758.5453
    ) % 1;

}


/* =========================================================
   SMOOTH NOISE
========================================================= */

function smoothNoise(
    x,
    z
) {

    const ix =
        Math.floor(x);

    const iz =
        Math.floor(z);


    const fx =
        x - ix;

    const fz =
        z - iz;


    const a =
        Math.sin(
            ix * 127.1 +
            iz * 311.7
        ) *
        43758.5453;


    const b =
        Math.sin(
            (ix + 1) * 127.1 +
            iz * 311.7
        ) *
        43758.5453;


    const c =
        Math.sin(
            ix * 127.1 +
            (iz + 1) * 311.7
        ) *
        43758.5453;


    const d =
        Math.sin(
            (ix + 1) * 127.1 +
            (iz + 1) * 311.7
        ) *
        43758.5453;


    const va =
        a - Math.floor(a);

    const vb =
        b - Math.floor(b);

    const vc =
        c - Math.floor(c);

    const vd =
        d - Math.floor(d);


    const ux =
        fx * fx *
        (3 - 2 * fx);

    const uz =
        fz * fz *
        (3 - 2 * fz);


    const ab =
        THREE.MathUtils.lerp(
            va,
            vb,
            ux
        );


    const cd =
        THREE.MathUtils.lerp(
            vc,
            vd,
            ux
        );


    return THREE.MathUtils.lerp(
        ab,
        cd,
        uz
    );

}


/* =========================================================
   TERRAIN HEIGHT
========================================================= */

function mountainHeight(
    x,
    z
) {

    /*
     * Large mountain masses
     */

    const large =
        smoothNoise(
            x * 0.025,
            z * 0.025
        );


    /*
     * Medium ridges
     */

    const medium =
        smoothNoise(
            x * 0.060,
            z * 0.060
        );


    /*
     * Fine rock detail
     */

    const fine =
        smoothNoise(
            x * 0.16,
            z * 0.16
        );


    /*
     * Long Himalayan ridges
     */

    const ridgeWave =
        Math.sin(
            x * 0.075 +
            z * 0.022
        );


    const ridge =
        Math.pow(
            Math.abs(
                ridgeWave
            ),
            1.8
        );


    /*
     * Main mountain elevation
     */

    let h =
        large * 4.5;


    h +=
        medium * 5.5;


    h +=
        ridge * 10;


    h +=
        fine * 1.2;


    /*
     * Create valleys
     */

    const valley =
        Math.sin(
            z * 0.055
        ) *
        Math.sin(
            x * 0.035
        );


    h +=
        valley * 2.0;


    /*
     * Make the centre slightly lower
     * to create a valley through which
     * our road can travel.
     */

    const valleyMask =
        Math.exp(
            -Math.pow(
                x / 8,
                2
            )
        );


    h -=
        valleyMask *
        5.0;


    return h - 5;

}


/* =========================================================
   CONTINUOUS TERRAIN
========================================================= */

const SIZE =
    110;


const SEGMENTS =
    180;


const vertices = [];


const indices = [];


const uvs = [];


for (
    let z = 0;
    z <= SEGMENTS;
    z++
) {

    for (
        let x = 0;
        x <= SEGMENTS;
        x++
    ) {

        const px =
            (
                x /
                SEGMENTS -
                0.5
            ) * SIZE;


        const pz =
            (
                z /
                SEGMENTS -
                0.5
            ) * SIZE;


        const py =
            mountainHeight(
                px,
                pz
            );


        vertices.push(
            px,
            py,
            pz
        );


        uvs.push(
            x / SEGMENTS,
            z / SEGMENTS
        );

    }

}


/* =========================================================
   TERRAIN TRIANGLES
========================================================= */

for (
    let z = 0;
    z < SEGMENTS;
    z++
) {

    for (
        let x = 0;
        x < SEGMENTS;
        x++
    ) {

        const a =
            z *
            (SEGMENTS + 1) +
            x;


        const b =
            a + 1;


        const c =
            a +
            (SEGMENTS + 1);


        const d =
            c + 1;


        /*
         * Alternate diagonal directions
         * to reduce visible patterns.
         */

        if (
            (x + z) % 2 === 0
        ) {

            indices.push(
                a,
                c,
                b,

                b,
                c,
                d
            );

        } else {

            indices.push(
                a,
                c,
                d,

                a,
                d,
                b
            );

        }

    }

}


/* =========================================================
   BUILD GEOMETRY
========================================================= */

const terrainGeometry =
    new THREE.BufferGeometry();


terrainGeometry.setAttribute(
    "position",

    new THREE.Float32BufferAttribute(
        vertices,
        3
    )
);


terrainGeometry.setAttribute(
    "uv",

    new THREE.Float32BufferAttribute(
        uvs,
        2
    )
);


terrainGeometry.setIndex(
    indices
);


terrainGeometry.computeVertexNormals();


/* =========================================================
   TERRAIN MATERIAL
========================================================= */

const terrainMaterial =
    new THREE.ShaderMaterial({

        uniforms: {

            snowLine:
            {
                value: 9.0
            },

            snowColor:
            {
                value:
                    new THREE.Color(
                        0xe9eeee
                    )
            },

            rockColor:
            {
                value:
                    new THREE.Color(
                        0x4a5558
                    )
            },

            valleyColor:
            {
                value:
                    new THREE.Color(
                        0x26352c
                    )
            }

        },


        vertexShader: `

            varying vec3 vWorldPosition;
            varying vec3 vNormal;

            void main() {

                vNormal =
                    normalize(
                        normalMatrix *
                        normal
                    );

                vec4 world =
                    modelMatrix *
                    vec4(
                        position,
                        1.0
                    );

                vWorldPosition =
                    world.xyz;

                gl_Position =
                    projectionMatrix *
                    modelViewMatrix *
                    vec4(
                        position,
                        1.0
                    );

            }

        `,


        fragmentShader: `

            uniform float snowLine;

            uniform vec3 snowColor;
            uniform vec3 rockColor;
            uniform vec3 valleyColor;

            varying vec3 vWorldPosition;
            varying vec3 vNormal;


            void main() {

                float height =
                    vWorldPosition.y;


                /*
                 * Mountain snow
                 */

                float snow =
                    smoothstep(
                        snowLine - 2.0,
                        snowLine + 3.0,
                        height
                    );


                /*
                 * Valley greenery
                 */

                float valley =
                    1.0 -
                    smoothstep(
                        0.0,
                        6.0,
                        height
                    );


                vec3 color =
                    mix(
                        rockColor,
                        snowColor,
                        snow
                    );


                color =
                    mix(
                        color,
                        valleyColor,
                        valley * 0.65
                    );


                /*
                 * Lighting
                 */

                float light =
                    dot(
                        normalize(vNormal),
                        normalize(
                            vec3(
                                -0.5,
                                1.0,
                                0.35
                            )
                        )
                    );


                light =
                    0.55 +
                    light * 0.45;


                color *=
                    light;


                gl_FragColor =
                    vec4(
                        color,
                        1.0
                    );

            }

        `

    });


const terrain =
    new THREE.Mesh(
        terrainGeometry,
        terrainMaterial
    );


terrain.position.set(
    0,
    -2,
    -16
);


scene.add(
    terrain
);


/* =========================================================
   ROAD
========================================================= */

const roadCurve =
    new THREE.CatmullRomCurve3([

        new THREE.Vector3(
            -2.5,
            0.0,
            20
        ),

        new THREE.Vector3(
            2.0,
            0.0,
            13
        ),

        new THREE.Vector3(
            -1.5,
            0.0,
            6
        ),

        new THREE.Vector3(
            2.2,
            0.0,
            -2
        ),

        new THREE.Vector3(
            -2,
            0.0,
            -10
        ),

        new THREE.Vector3(
            1.0,
            0.0,
            -20
        )

    ]);


const roadGeometry =
    new THREE.TubeGeometry(
        roadCurve,
        120,
        0.42,
        10,
        false
    );


const roadMaterial =
    new THREE.MeshStandardMaterial({

        color:
            0x26292a,

        roughness:
            0.88

    });


const road =
    new THREE.Mesh(
        roadGeometry,
        roadMaterial
    );


road.position.y =
    0.15;


scene.add(
    road
);


/* =========================================================
   ROAD LINE
========================================================= */

const roadPoints =
    roadCurve.getPoints(
        180
    );


const lineGeometry =
    new THREE.BufferGeometry()
        .setFromPoints(
            roadPoints
        );


const lineMaterial =
    new THREE.LineBasicMaterial({

        color:
            0xd4bd76,

        transparent:
            true,

        opacity:
            0.75

    });


const roadLine =
    new THREE.Line(
        lineGeometry,
        lineMaterial
    );


roadLine.position.y =
    0.48;


scene.add(
    roadLine
);


/* =========================================================
   CLOUDS
========================================================= */

const cloudGroup =
    new THREE.Group();


scene.add(
    cloudGroup
);


const cloudMaterial =
    new THREE.MeshBasicMaterial({

        color:
            0xffffff,

        transparent:
            true,

        opacity:
            0.10,

        depthWrite:
            false

    });


for (
    let i = 0;
    i < 22;
    i++
) {

    const cloud =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                2 +
                Math.random() * 3,
                20,
                12
            ),

            cloudMaterial

        );


    cloud.scale.set(
        3 +
        Math.random() * 2,
        0.4 +
        Math.random() * 0.3,
        1.2 +
        Math.random()
    );


    cloud.position.set(

        (
            Math.random() -
            0.5
        ) * 80,

        8 +
        Math.random() * 10,

        -30 -
        Math.random() * 40

    );


    cloudGroup.add(
        cloud
    );

}


/* =========================================================
   SNOW
========================================================= */

const snowCount =
    window.innerWidth > 1100
        ? 1800
        : 800;


const snowArray =
    new Float32Array(
        snowCount * 3
    );


for (
    let i = 0;
    i < snowCount * 3;
    i += 3
) {

    snowArray[i] =
        (
            Math.random() -
            0.5
        ) * 65;


    snowArray[i + 1] =
        Math.random() * 30;


    snowArray[i + 2] =
        (
            Math.random() -
            0.5
        ) * 65;

}


const snowGeometry =
    new THREE.BufferGeometry();


snowGeometry.setAttribute(
    "position",

    new THREE.BufferAttribute(
        snowArray,
        3
    )
);


const snowMaterial =
    new THREE.PointsMaterial({

        color:
            0xffffff,

        size:
            0.035,

        transparent:
            true,

        opacity:
            0.65,

        depthWrite:
            false

    });


const snowfall =
    new THREE.Points(
        snowGeometry,
        snowMaterial
    );


scene.add(
    snowfall
);


/* =========================================================
   MOUSE
========================================================= */

let mouseX = 0;
let mouseY = 0;

let smoothX = 0;
let smoothY = 0;


window.addEventListener(
    "pointermove",
    event => {

        mouseX =
            (
                event.clientX /
                window.innerWidth -
                0.5
            ) * 2;


        mouseY =
            (
                event.clientY /
                window.innerHeight -
                0.5
            ) * 2;

    }
);


/* =========================================================
   ANIMATION
========================================================= */

const clock =
    new THREE.Clock();


function animate() {

    requestAnimationFrame(
        animate
    );


    const time =
        clock.getElapsedTime();


    smoothX +=
        (
            mouseX -
            smoothX
        ) * 0.025;


    smoothY +=
        (
            mouseY -
            smoothY
        ) * 0.025;


    /*
     * Camera
     */

    camera.position.x =
        smoothX * 1.5;


    camera.position.y =
        5.0 -
        smoothY * 0.6 +
        Math.sin(
            time * 0.15
        ) * 0.10;


    camera.position.z =
        22 -
        Math.sin(
            time * 0.08
        ) * 1.5;


    camera.lookAt(
        0,
        5,
        -15
    );


    /*
     * Clouds
     */

    cloudGroup.position.x =
        Math.sin(
            time * 0.012
        ) * 2;


    cloudGroup.position.z =
        Math.cos(
            time * 0.009
        ) * 1.5;


    /*
     * Snow
     */

    const p =
        snowfall.geometry
            .attributes
            .position;


    for (
        let i = 0;
        i < snowCount;
        i++
    ) {

        const index =
            i * 3;


        let x =
            p.getX(index);

        let y =
            p.getY(index);

        let z =
            p.getZ(index);


        y -= 0.016;


        x +=
            Math.sin(
                time * 0.5 +
                i
            ) * 0.002;


        if (
            y < -2
        ) {

            y = 28;

            x =
                (
                    Math.random() -
                    0.5
                ) * 65;

            z =
                (
                    Math.random() -
                    0.5
                ) * 65;

        }


        p.setXYZ(
            index,
            x,
            y,
            z
        );

    }


    p.needsUpdate =
        true;


    renderer.render(
        scene,
        camera
    );

}


animate();


/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;


        camera.updateProjectionMatrix();


        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );


        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio,
                2
            )
        );

    }
);


/* =========================================================
   EXPLORE BUTTON
========================================================= */

const exploreButton =
    document.getElementById(
        "exploreBtn"
    );


if (
    exploreButton
) {

    exploreButton.addEventListener(
        "click",
        () => {

            exploreButton.innerHTML = `
                <span>ENTERING INDIA</span>
                <span class="arrow">→</span>
            `;

        }
    );

}
