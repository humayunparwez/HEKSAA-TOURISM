import * as THREE from
"https://unpkg.com/three@0.170.0/build/three.module.js";

/* =====================================================
   HEKSAA — CINEMATIC HIMALAYAN HERO
   100% CODE GENERATED
===================================================== */

const canvas = document.getElementById("three-canvas");

/* =====================================================
   SCENE
===================================================== */

const scene = new THREE.Scene();

scene.fog = new THREE.FogExp2(
    0x8da0ad,
    0.018
);


/* =====================================================
   CAMERA
===================================================== */

const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(
    0,
    3.2,
    18
);


/* =====================================================
   RENDERER
===================================================== */

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
});

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.outputColorSpace =
    THREE.SRGBColorSpace;

renderer.toneMapping =
    THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure = 1.15;


/* =====================================================
   LIGHTING
===================================================== */

const ambient = new THREE.HemisphereLight(
    0xcfe5ff,
    0x182026,
    1.8
);

scene.add(ambient);


const sun = new THREE.DirectionalLight(
    0xffe7c2,
    4
);

sun.position.set(
    -12,
    18,
    8
);

scene.add(sun);


/* =====================================================
   SKY
===================================================== */

const skyGeometry =
    new THREE.SphereGeometry(
        120,
        32,
        32
    );

const skyMaterial =
    new THREE.ShaderMaterial({

        side: THREE.BackSide,

        uniforms: {

            topColor: {
                value: new THREE.Color(
                    0x102b48
                )
            },

            horizonColor: {
                value: new THREE.Color(
                    0xd9c9ad
                )
            },

            bottomColor: {
                value: new THREE.Color(
                    0x26323a
                )
            }

        },

        vertexShader: `

            varying vec3 vWorldPosition;

            void main() {

                vec4 worldPosition =
                    modelMatrix *
                    vec4(position, 1.0);

                vWorldPosition =
                    worldPosition.xyz;

                gl_Position =
                    projectionMatrix *
                    modelViewMatrix *
                    vec4(position, 1.0);

            }

        `,

        fragmentShader: `

            uniform vec3 topColor;
            uniform vec3 horizonColor;
            uniform vec3 bottomColor;

            varying vec3 vWorldPosition;

            void main() {

                float height =
                    normalize(vWorldPosition).y;

                vec3 color;

                if(height > 0.0) {

                    color =
                        mix(
                            horizonColor,
                            topColor,
                            smoothstep(
                                0.0,
                                0.8,
                                height
                            )
                        );

                } else {

                    color =
                        mix(
                            horizonColor,
                            bottomColor,
                            smoothstep(
                                0.0,
                                -0.5,
                                height
                            )
                        );

                }

                gl_FragColor =
                    vec4(color, 1.0);

            }

        `

    });

const sky =
    new THREE.Mesh(
        skyGeometry,
        skyMaterial
    );

scene.add(sky);


/* =====================================================
   SIMPLE PROCEDURAL NOISE
===================================================== */

function noise(x, z) {

    const value =
        Math.sin(x * 0.75) *
        Math.cos(z * 0.55) +

        Math.sin(
            x * 1.7 +
            z * 0.8
        ) * 0.45 +

        Math.cos(
            x * 2.8 -
            z * 1.4
        ) * 0.18;

    return value;
}


/* =====================================================
   MOUNTAIN CREATOR
===================================================== */

function createMountain(
    x,
    z,
    width,
    height,
    rotation,
    detail
) {

    const geometry =
        new THREE.ConeGeometry(
            width,
            height,
            detail,
            30
        );


    /* deform vertices */

    const position =
        geometry.attributes.position;


    for (
        let i = 0;
        i < position.count;
        i++
    ) {

        const vx =
            position.getX(i);

        const vy =
            position.getY(i);

        const vz =
            position.getZ(i);


        const variation =
            noise(
                vx * 1.4,
                vz * 1.4
            );


        const factor =
            Math.max(
                0,
                (vy / height) + 0.5
            );


        position.setX(
            i,
            vx +
            variation *
            0.18 *
            factor
        );


        position.setZ(
            i,
            vz +
            variation *
            0.18 *
            factor
        );

    }


    geometry.computeVertexNormals();


    const material =
        new THREE.MeshStandardMaterial({

            color:
                0x46525a,

            roughness:
                0.92,

            metalness:
                0.02

        });


    const mountain =
        new THREE.Mesh(
            geometry,
            material
        );


    mountain.position.set(
        x,
        height / 2 - 1,
        z
    );


    mountain.rotation.y =
        rotation;


    mountain.scale.y =
        1.0;


    scene.add(
        mountain
    );


    /* ===============================
       SNOW CAP
    =============================== */

    const snowGeometry =
        new THREE.ConeGeometry(
            width * 0.42,
            height * 0.34,
            detail,
            12
        );


    const snowMaterial =
        new THREE.MeshStandardMaterial({

            color:
                0xf1f4f3,

            roughness:
                0.88,

            metalness:
                0.0

        });


    const snow =
        new THREE.Mesh(
            snowGeometry,
            snowMaterial
        );


    snow.position.set(
        x,
        height * 0.82,
        z - 0.02
    );


    snow.rotation.y =
        rotation;


    scene.add(
        snow
    );


    return mountain;
}


/* =====================================================
   BACK MOUNTAINS
===================================================== */

createMountain(
    -12,
    -18,
    9,
    13,
    0.4,
    9
);

createMountain(
    -5,
    -22,
    11,
    17,
    -0.3,
    10
);

createMountain(
    4,
    -25,
    13,
    20,
    0.2,
    10
);

createMountain(
    13,
    -20,
    10,
    15,
    -0.2,
    9
);


/* =====================================================
   MID MOUNTAINS
===================================================== */

createMountain(
    -10,
    -8,
    7,
    10,
    0.5,
    8
);

createMountain(
    -3,
    -11,
    8,
    13,
    -0.4,
    8
);

createMountain(
    6,
    -10,
    9,
    15,
    0.3,
    8
);

createMountain(
    13,
    -7,
    7,
    11,
    -0.5,
    8
);


/* =====================================================
   FOREGROUND TERRAIN
===================================================== */

const terrainWidth = 45;
const terrainDepth = 45;

const terrainGeometry =
    new THREE.PlaneGeometry(
        terrainWidth,
        terrainDepth,
        80,
        80
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


    const elevation =
        noise(
            x * 0.35,
            y * 0.35
        ) * 1.1;


    terrainPosition.setZ(
        i,
        elevation
    );

}


terrainGeometry.computeVertexNormals();

terrainGeometry.rotateX(
    -Math.PI / 2
);


const terrainMaterial =
    new THREE.MeshStandardMaterial({

        color:
            0x29352f,

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


terrain.position.y =
    -1.2;

terrain.position.z =
    4;


scene.add(
    terrain
);


/* =====================================================
   VALLEY PATH
===================================================== */

const roadShape =
    new THREE.Shape();


roadShape.moveTo(
    -1.0,
    -18
);

roadShape.bezierCurveTo(
    -0.5,
    -8,
    2.2,
    0,
    0.5,
    10
);

roadShape.bezierCurveTo(
    0.0,
    14,
    -1.0,
    17,
    -2.0,
    20
);


const roadGeometry =
    new THREE.ShapeGeometry(
        roadShape
    );


const roadMaterial =
    new THREE.MeshStandardMaterial({

        color:
            0x353a3b,

        roughness:
            0.85,

        metalness:
            0.05

    });


const road =
    new THREE.Mesh(
        roadGeometry,
        roadMaterial
    );


road.rotation.x =
    -Math.PI / 2;

road.position.y =
    -0.82;

road.position.z =
    -1;

road.scale.set(
    1.5,
    1,
    1
);

scene.add(
    road
);


/* =====================================================
   SNOW PARTICLES
===================================================== */

const snowCount =
    window.innerWidth < 900
        ? 700
        : 1600;


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
        (Math.random() - 0.5) * 35;

    snowPositions[i + 1] =
        Math.random() * 20;

    snowPositions[i + 2] =
        (Math.random() - 0.5) * 30;

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


const snowMaterialParticles =
    new THREE.PointsMaterial({

        color:
            0xffffff,

        size:
            0.035,

        transparent:
            true,

        opacity:
            0.75,

        depthWrite:
            false

    });


const snowParticles =
    new THREE.Points(
        snowGeometry,
        snowMaterialParticles
    );


scene.add(
    snowParticles
);


/* =====================================================
   ATMOSPHERIC CLOUDS
===================================================== */

const cloudMaterial =
    new THREE.MeshBasicMaterial({

        color:
            0xffffff,

        transparent:
            true,

        opacity:
            0.075,

        depthWrite:
            false

    });


for (
    let i = 0;
    i < 18;
    i++
) {

    const cloud =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                2 +
                Math.random() * 3,
                16,
                10
            ),
            cloudMaterial
        );


    cloud.scale.set(
        2.5,
        0.45,
        1.0
    );


    cloud.position.set(
        (Math.random() - 0.5) * 35,
        7 +
        Math.random() * 8,
        -15 -
        Math.random() * 15
    );


    scene.add(
        cloud
    );

}


/* =====================================================
   CAMERA MOUSE MOVEMENT
===================================================== */

let mouseX = 0;
let mouseY = 0;

let targetMouseX = 0;
let targetMouseY = 0;


window.addEventListener(
    "pointermove",
    (event) => {

        targetMouseX =
            (
                event.clientX /
                window.innerWidth -
                0.5
            ) * 2;


        targetMouseY =
            (
                event.clientY /
                window.innerHeight -
                0.5
            ) * 2;

    }
);


/* =====================================================
   CINEMATIC CAMERA
===================================================== */

const clock =
    new THREE.Clock();


function animate() {

    requestAnimationFrame(
        animate
    );


    const time =
        clock.getElapsedTime();


    /* smooth mouse */

    mouseX +=
        (
            targetMouseX -
            mouseX
        ) * 0.025;


    mouseY +=
        (
            targetMouseY -
            mouseY
        ) * 0.025;


    /* camera movement */

    camera.position.x =
        mouseX * 1.2;


    camera.position.y =
        3.0 -
        mouseY * 0.5 +
        Math.sin(
            time * 0.18
        ) * 0.15;


    camera.position.z =
        18 -
        Math.sin(
            time * 0.12
        ) * 1.5;


    camera.lookAt(
        0,
        4,
        -8
    );


    /* snow movement */

    snowParticles.rotation.y =
        time * 0.015;


    const snowPosition =
        snowParticles.geometry
            .attributes
            .position;


    for (
        let i = 0;
        i < snowCount;
        i++
    ) {

        let y =
            snowPosition.getY(i * 3);

        y -= 0.012;


        if (y < -1) {
            y = 18;
        }


        snowPosition.setY(
            i * 3,
            y
        );

    }


    snowPosition.needsUpdate =
        true;


    renderer.render(
        scene,
        camera
    );

}


animate();


/* =====================================================
   RESIZE
===================================================== */

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


/* =====================================================
   EXPLORE BUTTON
===================================================== */

const exploreButton =
    document.getElementById(
        "exploreBtn"
    );


if (exploreButton) {

    exploreButton.addEventListener(
        "click",
        () => {

            exploreButton.innerHTML =
                `
                <span>ENTERING INDIA</span>
                <span class="arrow">→</span>
                `;

        }
    );

        }
