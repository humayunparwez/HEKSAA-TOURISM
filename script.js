import * as THREE from
"https://unpkg.com/three@0.170.0/build/three.module.js";


/* =========================================================
   HEKSAA
   DISCOVER INDIA BEYOND DESTINATIONS

   CONTINUOUS PROCEDURAL HIMALAYAN TERRAIN
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
        52,
        window.innerWidth /
        window.innerHeight,
        0.1,
        500
    );

camera.position.set(
    0,
    5.5,
    24
);


/* =========================================================
   RENDERER
========================================================= */

const renderer =
    new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        powerPreference: "high-performance"
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
   ATMOSPHERE
========================================================= */

scene.fog =
    new THREE.FogExp2(
        0x788895,
        0.012
    );


/* =========================================================
   LIGHTING
========================================================= */

const hemisphere =
    new THREE.HemisphereLight(
        0xc9dded,
        0x17211e,
        2.0
    );

scene.add(
    hemisphere
);


const sunlight =
    new THREE.DirectionalLight(
        0xffdfb0,
        4.5
    );

sunlight.position.set(
    -25,
    35,
    15
);

scene.add(
    sunlight
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

        side: THREE.BackSide,

        uniforms: {

            topColor: {
                value:
                    new THREE.Color(
                        0x061626
                    )
            },

            middleColor: {
                value:
                    new THREE.Color(
                        0x29445b
                    )
            },

            horizonColor: {
                value:
                    new THREE.Color(
                        0xb8ad9c
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
            uniform vec3 middleColor;
            uniform vec3 horizonColor;

            varying vec3 vWorldPosition;

            void main() {

                float h =
                    normalize(
                        vWorldPosition
                    ).y;

                vec3 color;

                if(h > 0.08) {

                    color =
                        mix(
                            middleColor,
                            topColor,
                            smoothstep(
                                0.08,
                                0.82,
                                h
                            )
                        );

                } else {

                    color =
                        mix(
                            horizonColor,
                            middleColor,
                            smoothstep(
                                -0.18,
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


const sky =
    new THREE.Mesh(
        skyGeometry,
        skyMaterial
    );

scene.add(
    sky
);


/* =========================================================
   DETERMINISTIC NOISE
========================================================= */

function hash(
    x,
    y
) {

    const value =
        Math.sin(
            x * 127.1 +
            y * 311.7
        ) *
        43758.5453123;

    return value -
        Math.floor(value);

}


function smoothStep(
    t
) {

    return (
        t *
        t *
        (
            3 -
            2 * t
        )
    );

}


function valueNoise(
    x,
    y
) {

    const x0 =
        Math.floor(x);

    const y0 =
        Math.floor(y);

    const x1 =
        x0 + 1;

    const y1 =
        y0 + 1;


    const sx =
        smoothStep(
            x - x0
        );

    const sy =
        smoothStep(
            y - y0
        );


    const n00 =
        hash(
            x0,
            y0
        );

    const n10 =
        hash(
            x1,
            y0
        );

    const n01 =
        hash(
            x0,
            y1
        );

    const n11 =
        hash(
            x1,
            y1
        );


    const nx0 =
        THREE.MathUtils.lerp(
            n00,
            n10,
            sx
        );

    const nx1 =
        THREE.MathUtils.lerp(
            n01,
            n11,
            sx
        );


    return THREE.MathUtils.lerp(
        nx0,
        nx1,
        sy
    ) * 2 - 1;

}


/* =========================================================
   FRACTAL TERRAIN NOISE
========================================================= */

function terrainNoise(
    x,
    z
) {

    let value = 0;

    let amplitude = 1;

    let frequency = 0.012;

    let totalAmplitude = 0;


    for (
        let i = 0;
        i < 5;
        i++
    ) {

        value +=
            valueNoise(
                x * frequency,
                z * frequency
            ) *
            amplitude;

        totalAmplitude +=
            amplitude;

        amplitude *= 0.5;

        frequency *= 2.0;

    }


    return (
        value /
        totalAmplitude
    );

}


/* =========================================================
   RIDGED MOUNTAIN NOISE
========================================================= */

function ridgeNoise(
    x,
    z
) {

    let value = 0;

    let amplitude = 1;

    let frequency = 0.018;

    let total = 0;


    for (
        let i = 0;
        i < 4;
        i++
    ) {

        const n =
            valueNoise(
                x * frequency,
                z * frequency
            );


        const ridge =
            1 -
            Math.abs(n);


        value +=
            ridge *
            amplitude;

        total +=
            amplitude;

        amplitude *= 0.5;

        frequency *= 2.0;

    }


    return (
        value /
        total
    );

}


/* =========================================================
   HEIGHT FUNCTION
========================================================= */

function getTerrainHeight(
    x,
    z
) {

    /*
     * Large continental shape
     */

    const large =
        terrainNoise(
            x * 0.65,
            z * 0.65
        );


    /*
     * Mountain ridges
     */

    const ridges =
        ridgeNoise(
            x,
            z
        );


    /*
     * Directional Himalayan ridges
     */

    const ridgeDirection =
        Math.sin(
            z * 0.045 +
            x * 0.018
        );


    const directional =
        Math.abs(
            ridgeDirection
        );


    /*
     * Valleys
     */

    const valley =
        Math.sin(
            x * 0.055 +
            z * 0.018
        );


    /*
     * Combine terrain
     */

    let height =
        large * 2.2;


    height +=
        ridges *
        9.5;


    height +=
        directional *
        5.5;


    height +=
        valley *
        1.4;


    /*
     * distant terrain
     */

    const distance =
        Math.sqrt(
            x * x +
            z * z
        );


    const distant =
        THREE.MathUtils.clamp(
            distance / 55,
            0,
            1
        );


    height *=
        0.92 +
        distant * 0.28;


    /*
     * Keep valley floor low
     */

    return height - 3.5;

}


/* =========================================================
   TERRAIN
========================================================= */

const terrainSize =
    110;

const terrainSegments =
    150;


const terrainGeometry =
    new THREE.PlaneGeometry(
        terrainSize,
        terrainSize,
        terrainSegments,
        terrainSegments
    );


const position =
    terrainGeometry.attributes.position;


/* =========================================================
   CREATE TERRAIN HEIGHT
========================================================= */

for (
    let i = 0;
    i < position.count;
    i++
) {

    const x =
        position.getX(i);

    const y =
        position.getY(i);


    const height =
        getTerrainHeight(
            x,
            y
        );


    position.setZ(
        i,
        height
    );

}


/* =========================================================
   TERRAIN NORMALS
========================================================= */

terrainGeometry.computeVertexNormals();


/* =========================================================
   TERRAIN COLORS
========================================================= */

const colors =
    new Float32Array(
        position.count * 3
    );


const normals =
    terrainGeometry.attributes.normal;


for (
    let i = 0;
    i < position.count;
    i++
) {

    const height =
        position.getZ(i);


    const normalized =
        THREE.MathUtils.clamp(
            (
                height + 4
            ) / 15,
            0,
            1
        );


    const upward =
        normals.getZ(i);


    let r;
    let g;
    let b;


    /* ==============================
       VALLEY
    ============================== */

    if (
        normalized < 0.20
    ) {

        r = 0.08;
        g = 0.14;
        b = 0.09;

    }


    /* ==============================
       LOWER ROCK
    ============================== */

    else if (
        normalized < 0.42
    ) {

        const t =
            (
                normalized -
                0.20
            ) / 0.22;


        r =
            THREE.MathUtils.lerp(
                0.08,
                0.20,
                t
            );

        g =
            THREE.MathUtils.lerp(
                0.14,
                0.19,
                t
            );

        b =
            THREE.MathUtils.lerp(
                0.09,
                0.18,
                t
            );

    }


    /* ==============================
       ROCK
    ============================== */

    else if (
        normalized < 0.68
    ) {

        const t =
            (
                normalized -
                0.42
            ) / 0.26;


        r =
            THREE.MathUtils.lerp(
                0.20,
                0.34,
                t
            );

        g =
            THREE.MathUtils.lerp(
                0.19,
                0.32,
                t
            );

        b =
            THREE.MathUtils.lerp(
                0.18,
                0.34,
                t
            );

    }


    /* ==============================
       SNOW
    ============================== */

    else {

        const snow =
            THREE.MathUtils.clamp(
                (
                    normalized -
                    0.68
                ) / 0.25,
                0,
                1
            );


        const slope =
            THREE.MathUtils.clamp(
                upward,
                0,
                1
            );


        const snowAmount =
            snow *
            (
                0.45 +
                slope * 0.55
            );


        r =
            THREE.MathUtils.lerp(
                0.34,
                0.94,
                snowAmount
            );

        g =
            THREE.MathUtils.lerp(
                0.36,
                0.96,
                snowAmount
            );

        b =
            THREE.MathUtils.lerp(
                0.36,
                0.98,
                snowAmount
            );

    }


    /*
     * Small natural color variation
     */

    const variation =
        valueNoise(
            position.getX(i) * 0.25,
            position.getY(i) * 0.25
        ) *
        0.025;


    r += variation;
    g += variation;
    b += variation;


    colors[
        i * 3
    ] = THREE.MathUtils.clamp(
        r,
        0,
        1
    );


    colors[
        i * 3 + 1
    ] = THREE.MathUtils.clamp(
        g,
        0,
        1
    );


    colors[
        i * 3 + 2
    ] = THREE.MathUtils.clamp(
        b,
        0,
        1
    );

}


terrainGeometry.setAttribute(
    "color",
    new THREE.BufferAttribute(
        colors,
        3
    )
);


/* =========================================================
   ROTATE TERRAIN
========================================================= */

terrainGeometry.rotateX(
    -Math.PI / 2
);


/* =========================================================
   TERRAIN MATERIAL
========================================================= */

const terrainMaterial =
    new THREE.MeshStandardMaterial({

        vertexColors:
            true,

        roughness:
            0.94,

        metalness:
            0.01,

        flatShading:
            false

    });


const terrain =
    new THREE.Mesh(
        terrainGeometry,
        terrainMaterial
    );


terrain.position.set(
    0,
    -1.8,
    -15
);


scene.add(
    terrain
);


/* =========================================================
   FAR MOUNTAIN ATMOSPHERE
========================================================= */

const farGeometry =
    new THREE.PlaneGeometry(
        140,
        40,
        100,
        35
    );


const farPosition =
    farGeometry.attributes.position;


for (
    let i = 0;
    i < farPosition.count;
    i++
) {

    const x =
        farPosition.getX(i);

    const y =
        farPosition.getY(i);


    const ridge =
        Math.abs(
            Math.sin(
                x * 0.08
            )
        );


    const n =
        terrainNoise(
            x * 0.5,
            y
        );


    const h =
        ridge * 15 +
        n * 3;


    farPosition.setZ(
        i,
        h
    );

}


farGeometry.computeVertexNormals();


const farMaterial =
    new THREE.MeshStandardMaterial({

        color:
            0x52636c,

        roughness:
            1,

        transparent:
            true,

        opacity:
            0.68

    });


const farMountains =
    new THREE.Mesh(
        farGeometry,
        farMaterial
    );


farMountains.rotation.x =
    -Math.PI / 2;


farMountains.position.set(
    0,
    0,
    -48
);


scene.add(
    farMountains
);


/* =========================================================
   ROAD
========================================================= */

const roadCurve =
    new THREE.CatmullRomCurve3([

        new THREE.Vector3(
            -4,
            -0.45,
            18
        ),

        new THREE.Vector3(
            2,
            -0.35,
            11
        ),

        new THREE.Vector3(
            -3,
            -0.20,
            5
        ),

        new THREE.Vector3(
            1,
            0.00,
            -2
        ),

        new THREE.Vector3(
            -1,
            0.20,
            -10
        ),

        new THREE.Vector3(
            3,
            0.35,
            -18
        )

    ]);


const roadGeometry =
    new THREE.TubeGeometry(
        roadCurve,
        120,
        0.48,
        10,
        false
    );


const roadMaterial =
    new THREE.MeshStandardMaterial({

        color:
            0x262a2b,

        roughness:
            0.9,

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
   ROAD CENTER LINE
========================================================= */

const roadPoints =
    roadCurve.getPoints(
        180
    );


const roadLineGeometry =
    new THREE.BufferGeometry()
        .setFromPoints(
            roadPoints
        );


const roadLineMaterial =
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
        roadLineGeometry,
        roadLineMaterial
    );


roadLine.position.y =
    0.48;


scene.add(
    roadLine
);


/* =========================================================
   CLOUDS
========================================================= */

const clouds =
    new THREE.Group();

scene.add(
    clouds
);


const cloudMaterial =
    new THREE.MeshBasicMaterial({

        color:
            0xffffff,

        transparent:
            true,

        opacity:
            0.095,

        depthWrite:
            false

    });


for (
    let i = 0;
    i < 28;
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
        Math.random() * 3,

        0.35 +
        Math.random() * 0.35,

        1.0 +
        Math.random() * 1.5
    );


    cloud.position.set(

        (
            Math.random() -
            0.5
        ) * 80,

        7 +
        Math.random() * 12,

        -15 -
        Math.random() * 50

    );


    clouds.add(
        cloud
    );

}


/* =========================================================
   SNOW PARTICLES
========================================================= */

const snowCount =
    window.innerWidth >= 1200
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
        ) * 70;


    snowPositions[i + 1] =
        Math.random() * 30;


    snowPositions[i + 2] =
        (
            Math.random() -
            0.5
        ) * 70;

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
            0.65,

        depthWrite:
            false

    });


const snow =
    new THREE.Points(
        snowGeometry,
        snowMaterial
    );


scene.add(
    snow
);


/* =========================================================
   CAMERA INTERACTION
========================================================= */

let pointerX = 0;
let pointerY = 0;

let smoothX = 0;
let smoothY = 0;


window.addEventListener(
    "pointermove",
    event => {

        pointerX =
            (
                event.clientX /
                window.innerWidth -
                0.5
            ) * 2;


        pointerY =
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
            pointerX -
            smoothX
        ) * 0.025;


    smoothY +=
        (
            pointerY -
            smoothY
        ) * 0.025;


    /* -----------------------------------------------
       CINEMATIC CAMERA
    ----------------------------------------------- */

    camera.position.x =
        smoothX * 1.8;


    camera.position.y =
        5.0 -
        smoothY * 0.8 +
        Math.sin(
            time * 0.15
        ) * 0.12;


    camera.position.z =
        24 -
        Math.sin(
            time * 0.08
        ) * 2;


    camera.lookAt(
        0,
        5,
        -18
    );


    /* -----------------------------------------------
       CLOUD MOTION
    ----------------------------------------------- */

    clouds.position.x =
        Math.sin(
            time * 0.015
        ) * 2;


    clouds.position.z =
        Math.cos(
            time * 0.01
        ) * 1.5;


    /* -----------------------------------------------
       SNOW MOTION
    ----------------------------------------------- */

    const particles =
        snow.geometry
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


        y -= 0.016;


        x +=
            Math.sin(
                time * 0.6 +
                i
            ) * 0.002;


        if (
            y < -3
        ) {

            y = 28;


            x =
                (
                    Math.random() -
                    0.5
                ) * 70;


            z =
                (
                    Math.random() -
                    0.5
                ) * 70;

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
