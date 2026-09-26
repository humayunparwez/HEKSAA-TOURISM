import * as THREE from
"https://unpkg.com/three@0.170.0/build/three.module.js";


/* =========================================================
   HEKSAA
   DISCOVER INDIA BEYOND DESTINATIONS

   CINEMATIC HIMALAYAN ENVIRONMENT
   Procedural / Code Generated
========================================================= */


/* =========================================================
   CANVAS
========================================================= */

const canvas =
    document.getElementById("three-canvas");


/* =========================================================
   SCENE
========================================================= */

const scene =
    new THREE.Scene();


/* =========================================================
   CAMERA
========================================================= */

const camera =
    new THREE.PerspectiveCamera(
        55,
        window.innerWidth /
        window.innerHeight,
        0.1,
        1000
    );

camera.position.set(
    0,
    3.5,
    24
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
   ATMOSPHERIC FOG
========================================================= */

scene.fog =
    new THREE.FogExp2(
        0x788894,
        0.014
    );


/* =========================================================
   LIGHTING
========================================================= */

const hemisphereLight =
    new THREE.HemisphereLight(
        0xbcd5ed,
        0x18221f,
        2.2
    );

scene.add(
    hemisphereLight
);


const sunlight =
    new THREE.DirectionalLight(
        0xffdfad,
        4.2
    );

sunlight.position.set(
    -18,
    22,
    10
);

sunlight.castShadow = false;

scene.add(
    sunlight
);


/* =========================================================
   SUN
========================================================= */

const sun =
    new THREE.Mesh(

        new THREE.SphereGeometry(
            1.8,
            32,
            32
        ),

        new THREE.MeshBasicMaterial({
            color: 0xffd79b,
            transparent: true,
            opacity: 0.14
        })

    );

sun.position.set(
    -13,
    12,
    -38
);

scene.add(
    sun
);


/* =========================================================
   SKY
========================================================= */

const skyGeometry =
    new THREE.SphereGeometry(
        180,
        48,
        32
    );


const skyMaterial =
    new THREE.ShaderMaterial({

        side:
            THREE.BackSide,

        uniforms: {

            topColor: {
                value:
                    new THREE.Color(
                        0x07192b
                    )
            },

            upperColor: {
                value:
                    new THREE.Color(
                        0x29465d
                    )
            },

            horizonColor: {
                value:
                    new THREE.Color(
                        0xb9b09f
                    )
            }

        },


        vertexShader: `

            varying vec3 vWorldPosition;

            void main() {

                vec4 worldPosition =
                    modelMatrix *
                    vec4(
                        position,
                        1.0
                    );

                vWorldPosition =
                    worldPosition.xyz;

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

            uniform vec3 topColor;
            uniform vec3 upperColor;
            uniform vec3 horizonColor;

            varying vec3 vWorldPosition;

            void main() {

                float h =
                    normalize(
                        vWorldPosition
                    ).y;


                vec3 color;


                if(h > 0.12) {

                    color =
                        mix(
                            upperColor,
                            topColor,
                            smoothstep(
                                0.12,
                                0.85,
                                h
                            )
                        );

                }

                else {

                    color =
                        mix(
                            horizonColor,
                            upperColor,
                            smoothstep(
                                -0.18,
                                0.12,
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


const sky =
    new THREE.Mesh(
        skyGeometry,
        skyMaterial
    );

scene.add(
    sky
);


/* =========================================================
   PROCEDURAL NOISE
========================================================= */

function noise(
    x,
    z
) {

    return (

        Math.sin(
            x * 0.27 +
            z * 0.13
        ) * 0.50 +

        Math.sin(
            x * 0.71 -
            z * 0.37
        ) * 0.25 +

        Math.cos(
            x * 1.41 +
            z * 0.83
        ) * 0.12 +

        Math.sin(
            x * 2.7 -
            z * 1.9
        ) * 0.06

    );

}


/* =========================================================
   MOUNTAIN CONTAINER
========================================================= */

const mountainGroup =
    new THREE.Group();

scene.add(
    mountainGroup
);


/* =========================================================
   CREATE PROCEDURAL MOUNTAIN
========================================================= */

function createMountain(
    x,
    z,
    width,
    height,
    rotation,
    detail
) {

    const geometry =
        new THREE.PlaneGeometry(
            width * 2,
            width * 2,
            detail,
            detail
        );


    const position =
        geometry.attributes.position;


    /* -----------------------------------------------
       CREATE TERRAIN
    ----------------------------------------------- */

    for (
        let i = 0;
        i < position.count;
        i++
    ) {

        const px =
            position.getX(i);

        const py =
            position.getY(i);


        const nx =
            px / width;

        const nz =
            py / width;


        const distance =
            Math.sqrt(
                nx * nx +
                nz * nz
            );


        /* mountain edge */

        let falloff =
            1 -
            distance;


        falloff =
            THREE.MathUtils.clamp(
                falloff,
                0,
                1
            );


        /* large terrain */

        const large =
            noise(
                px * 0.55,
                py * 0.55
            );


        /* medium terrain */

        const medium =
            noise(
                px * 1.35,
                py * 1.35
            );


        /* sharp ridges */

        const ridge =
            Math.abs(
                Math.sin(
                    px * 0.42 +
                    py * 0.18
                )
            );


        let elevation =
            Math.pow(
                falloff,
                1.65
            );


        elevation *=
            0.86 +
            large * 0.16;


        elevation +=
            medium *
            0.045 *
            falloff;


        elevation +=
            ridge *
            0.045 *
            falloff;


        elevation =
            Math.max(
                0,
                elevation
            );


        position.setZ(
            i,
            elevation *
            height
        );

    }


    geometry.computeVertexNormals();


    /* -----------------------------------------------
       VERTEX COLORS
    ----------------------------------------------- */

    const colors =
        new Float32Array(
            position.count * 3
        );


    const normals =
        geometry.attributes.normal;


    for (
        let i = 0;
        i < position.count;
        i++
    ) {

        const elevation =
            THREE.MathUtils.clamp(
                position.getZ(i) /
                height,
                0,
                1
            );


        const slope =
            normals.getZ(i);


        let r;
        let g;
        let b;


        /* DARK LOWER ROCK */

        if (
            elevation < 0.35
        ) {

            r = 0.11;
            g = 0.14;
            b = 0.15;

        }


        /* ROCK */

        else if (
            elevation < 0.58
        ) {

            const t =
                (
                    elevation -
                    0.35
                ) / 0.23;


            r =
                0.11 +
                t * 0.13;

            g =
                0.14 +
                t * 0.14;

            b =
                0.15 +
                t * 0.15;

        }


        /* SNOW */

        else {

            const snowAmount =
                THREE.MathUtils.clamp(
                    (
                        elevation -
                        0.58
                    ) / 0.35,
                    0,
                    1
                );


            const slopeAmount =
                THREE.MathUtils.clamp(
                    slope,
                    0,
                    1
                );


            const snow =
                snowAmount *
                (
                    0.45 +
                    slopeAmount *
                    0.55
                );


            r =
                0.23 +
                snow * 0.72;

            g =
                0.27 +
                snow * 0.70;

            b =
                0.29 +
                snow * 0.68;

        }


        colors[
            i * 3
        ] = r;


        colors[
            i * 3 + 1
        ] = g;


        colors[
            i * 3 + 2
        ] = b;

    }


    geometry.setAttribute(
        "color",
        new THREE.BufferAttribute(
            colors,
            3
        )
    );


    /* -----------------------------------------------
       ORIENT TERRAIN
    ----------------------------------------------- */

    geometry.rotateX(
        -Math.PI / 2
    );


    /* -----------------------------------------------
       MATERIAL
    ----------------------------------------------- */

    const material =
        new THREE.MeshStandardMaterial({

            vertexColors:
                true,

            roughness:
                0.95,

            metalness:
                0.01,

            flatShading:
                false

        });


    /* -----------------------------------------------
       MOUNTAIN
    ----------------------------------------------- */

    const mountain =
        new THREE.Mesh(
            geometry,
            material
        );


    mountain.position.set(
        x,
        -1.8,
        z
    );


    mountain.rotation.y =
        rotation;


    mountainGroup.add(
        mountain
    );


    return mountain;

}


/* =========================================================
   DISTANT RANGE
========================================================= */

createMountain(
    -18,
    -42,
    14,
    18,
    0.3,
    55
);


createMountain(
    -7,
    -46,
    17,
    25,
    -0.4,
    60
);


createMountain(
    6,
    -48,
    19,
    28,
    0.2,
    64
);


createMountain(
    20,
    -43,
    15,
    21,
    -0.3,
    56
);


/* =========================================================
   MIDDLE RANGE
========================================================= */

createMountain(
    -15,
    -22,
    10,
    15,
    0.4,
    55
);


createMountain(
    -5,
    -25,
    12,
    18,
    -0.3,
    58
);


createMountain(
    7,
    -25,
    13,
    20,
    0.25,
    60
);


createMountain(
    17,
    -22,
    10,
    16,
    -0.4,
    55
);


/* =========================================================
   FOREGROUND RIDGES
========================================================= */

createMountain(
    -12,
    -7,
    7,
    10,
    0.2,
    45
);


createMountain(
    11,
    -8,
    8,
    12,
    -0.3,
    48
);


/* =========================================================
   VALLEY FLOOR
========================================================= */

const terrainGeometry =
    new THREE.PlaneGeometry(
        65,
        60,
        100,
        100
    );


const terrainPosition =
    terrainGeometry.attributes.position;


for (
    let i = 0;
    i < terrainPosition.count;
    i++
) {

    const x =
        terrainPosition.getX(i);

    const y =
        terrainPosition.getY(i);


    const large =
        noise(
            x * 0.30,
            y * 0.30
        );


    const small =
        noise(
            x * 1.1,
            y * 1.1
        );


    terrainPosition.setZ(
        i,
        large * 0.8 +
        small * 0.18
    );

}


terrainGeometry.computeVertexNormals();


terrainGeometry.rotateX(
    -Math.PI / 2
);


const terrainMaterial =
    new THREE.MeshStandardMaterial({

        color:
            0x26362d,

        roughness:
            0.98,

        metalness:
            0.0

    });


const terrain =
    new THREE.Mesh(
        terrainGeometry,
        terrainMaterial
    );


terrain.position.set(
    0,
    -2.0,
    5
);


scene.add(
    terrain
);


/* =========================================================
   MOUNTAIN ROAD
========================================================= */

const roadCurve =
    new THREE.CatmullRomCurve3([

        new THREE.Vector3(
            -3.0,
            -0.55,
            17
        ),

        new THREE.Vector3(
            2.0,
            -0.50,
            11
        ),

        new THREE.Vector3(
            -2.0,
            -0.45,
            5
        ),

        new THREE.Vector3(
            2.0,
            -0.40,
            -1
        ),

        new THREE.Vector3(
            -1.0,
            -0.35,
            -8
        ),

        new THREE.Vector3(
            1.0,
            -0.30,
            -16
        )

    ]);


const roadGeometry =
    new THREE.TubeGeometry(
        roadCurve,
        100,
        0.42,
        10,
        false
    );


const roadMaterial =
    new THREE.MeshStandardMaterial({

        color:
            0x25292a,

        roughness:
            0.88,

        metalness:
            0.02

    });


const road =
    new THREE.Mesh(
        roadGeometry,
        roadMaterial
    );


scene.add(
    road
);


/* =========================================================
   ROAD CENTER MARKING
========================================================= */

const roadPoints =
    roadCurve.getPoints(
        150
    );


const roadLineGeometry =
    new THREE.BufferGeometry()
        .setFromPoints(
            roadPoints
        );


const roadLineMaterial =
    new THREE.LineBasicMaterial({

        color:
            0xd5bd7d,

        transparent:
            true,

        opacity:
            0.72

    });


const roadLine =
    new THREE.Line(
        roadLineGeometry,
        roadLineMaterial
    );


roadLine.position.y =
    0.45;


scene.add(
    roadLine
);


/* =========================================================
   CLOUD SYSTEM
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
            0.11,

        depthWrite:
            false

    });


for (
    let i = 0;
    i < 24;
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
        2.5 +
        Math.random() * 2.5,

        0.4 +
        Math.random() * 0.4,

        1.0 +
        Math.random() * 1.2
    );


    cloud.position.set(

        (
            Math.random() -
            0.5
        ) * 55,

        6 +
        Math.random() * 10,

        -18 -
        Math.random() * 32

    );


    cloudGroup.add(
        cloud
    );

}


/* =========================================================
   SNOW PARTICLES
========================================================= */

const snowCount =
    window.innerWidth > 1100
        ? 2200
        : 1000;


const snowPositions =
    new Float32Array(
        snowCount * 3
    );


for (
    let i = 0;
    i < snowCount * 3;
    i += 3
) {

    snowPositions[i] =
        (
            Math.random() -
            0.5
        ) * 50;


    snowPositions[i + 1] =
        Math.random() * 25;


    snowPositions[i + 2] =
        (
            Math.random() -
            0.5
        ) * 50;

}


const snowGeometry =
    new THREE.BufferGeometry();


snowGeometry.setAttribute(
    "position",

    new THREE.BufferAttribute(
        snowPositions,
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
            0.68,

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
   CAMERA / MOUSE
========================================================= */

let targetX = 0;
let targetY = 0;

let smoothX = 0;
let smoothY = 0;


window.addEventListener(
    "pointermove",
    event => {

        targetX =
            (
                event.clientX /
                window.innerWidth -
                0.5
            ) * 2;


        targetY =
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


    /* -----------------------------------------------
       SMOOTH POINTER
    ----------------------------------------------- */

    smoothX +=
        (
            targetX -
            smoothX
        ) * 0.025;


    smoothY +=
        (
            targetY -
            smoothY
        ) * 0.025;


    /* -----------------------------------------------
       CINEMATIC CAMERA
    ----------------------------------------------- */

    camera.position.x =
        smoothX * 1.4;


    camera.position.y =
        3.5 -
        smoothY * 0.7 +
        Math.sin(
            time * 0.16
        ) * 0.12;


    camera.position.z =
        24 -
        Math.sin(
            time * 0.10
        ) * 2;


    camera.lookAt(
        0,
        3.0,
        -12
    );


    /* -----------------------------------------------
       CLOUD MOVEMENT
    ----------------------------------------------- */

    cloudGroup.position.x =
        Math.sin(
            time * 0.018
        ) * 2;


    cloudGroup.position.z =
        Math.cos(
            time * 0.012
        ) * 1.5;


    /* -----------------------------------------------
       SNOWFALL
    ----------------------------------------------- */

    const particles =
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
            particles.getX(index);


        let y =
            particles.getY(index);


        let z =
            particles.getZ(index);


        y -= 0.018;


        x +=
            Math.sin(
                time * 0.7 +
                i
            ) * 0.002;


        if (
            y < -2
        ) {

            y = 24;


            x =
                (
                    Math.random() -
                    0.5
                ) * 50;


            z =
                (
                    Math.random() -
                    0.5
                ) * 50;

        }


        particles.setXYZ(
            index,
            x,
            y,
            z
        );

    }


    particles.needsUpdate =
        true;


    /* -----------------------------------------------
       RENDER
    ----------------------------------------------- */

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
