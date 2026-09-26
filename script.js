import * as THREE from
"https://unpkg.com/three@0.170.0/build/three.module.js";

/* =========================================================
   HEKSAA
   CINEMATIC HIMALAYAN LANDSCAPE
   Procedural 3D — No external models
========================================================= */


/* =========================================================
   BASIC SETUP
========================================================= */

const canvas =
    document.getElementById("three-canvas");

const scene =
    new THREE.Scene();


/* =========================================================
   CAMERA
========================================================= */

const camera =
    new THREE.PerspectiveCamera(
        55,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

camera.position.set(
    0,
    4,
    22
);


/* =========================================================
   RENDERER
========================================================= */

const renderer =
    new THREE.WebGLRenderer({

        canvas: canvas,

        antialias: true,

        alpha: false,

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
   FOG
========================================================= */

scene.fog =
    new THREE.FogExp2(
        0x7c8990,
        0.018
    );


/* =========================================================
   LIGHTING
========================================================= */

const hemiLight =
    new THREE.HemisphereLight(
        0xbfdcff,
        0x202824,
        2.0
    );

scene.add(
    hemiLight
);


const sun =
    new THREE.DirectionalLight(
        0xffe3b5,
        4.5
    );

sun.position.set(
    -15,
    20,
    12
);

scene.add(
    sun
);


/* =========================================================
   SUN GLOW
========================================================= */

const sunGlow =
    new THREE.Mesh(

        new THREE.SphereGeometry(
            2.0,
            32,
            32
        ),

        new THREE.MeshBasicMaterial({
            color: 0xffd99a,
            transparent: true,
            opacity: 0.12
        })

    );

sunGlow.position.set(
    -13,
    12,
    -30
);

scene.add(
    sunGlow
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
                        0x081b31
                    )
            },

            middleColor: {
                value:
                    new THREE.Color(
                        0x63798a
                    )
            },

            horizonColor: {
                value:
                    new THREE.Color(
                        0xd7c3a6
                    )
            }

        },

        vertexShader: `

            varying vec3 worldPosition;

            void main() {

                vec4 wp =
                    modelMatrix *
                    vec4(
                        position,
                        1.0
                    );

                worldPosition =
                    wp.xyz;

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
            uniform vec3 middleColor;
            uniform vec3 horizonColor;

            varying vec3 worldPosition;

            void main() {

                float h =
                    normalize(
                        worldPosition
                    ).y;

                vec3 color;

                if(h > 0.05) {

                    color =
                        mix(
                            middleColor,
                            topColor,
                            smoothstep(
                                0.05,
                                0.8,
                                h
                            )
                        );

                } else {

                    color =
                        mix(
                            horizonColor,
                            middleColor,
                            smoothstep(
                                -0.2,
                                0.05,
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

function noise2D(
    x,
    z
) {

    return (
        Math.sin(
            x * 0.31 +
            z * 0.17
        ) * 0.5 +

        Math.sin(
            x * 0.73 -
            z * 0.41
        ) * 0.25 +

        Math.cos(
            x * 1.31 +
            z * 0.91
        ) * 0.12
    );

}


/* =========================================================
   MOUNTAIN GROUP
========================================================= */

const mountains =
    new THREE.Group();

scene.add(
    mountains
);


/* =========================================================
   CREATE REALISTIC-LOOKING MOUNTAIN
========================================================= */

function createMountain({

    x,
    z,
    width,
    height,
    rotation = 0,
    segments = 48

}) {

    const geometry =
        new THREE.ConeGeometry(
            width,
            height,
            segments,
            30
        );


    const position =
        geometry.attributes.position;


    /* -----------------------------------------------
       DEFORM MOUNTAIN
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

        const pz =
            position.getZ(i);


        const normalizedHeight =
            THREE.MathUtils.clamp(
                (
                    py +
                    height / 2
                ) / height,
                0,
                1
            );


        const horizontal =
            1 -
            normalizedHeight;


        const noise =
            noise2D(
                px * 2.0,
                pz * 2.0
            );


        position.setX(
            i,
            px +
            noise *
            horizontal *
            1.0
        );


        position.setZ(
            i,
            pz +
            noise *
            horizontal *
            1.0
        );


        /* make peak irregular */

        if (
            normalizedHeight >
            0.65
        ) {

            position.setX(
                i,
                position.getX(i) +
                Math.sin(
                    i * 2.7
                ) *
                0.08
            );

        }

    }


    geometry.computeVertexNormals();


    /* -----------------------------------------------
       MOUNTAIN MATERIAL
    ----------------------------------------------- */

    const material =
        new THREE.MeshStandardMaterial({

            color:
                0x465057,

            roughness:
                0.92,

            metalness:
                0.03

        });


    const mountain =
        new THREE.Mesh(
            geometry,
            material
        );


    mountain.position.set(
        x,
        height / 2 - 1.8,
        z
    );


    mountain.rotation.y =
        rotation;


    mountains.add(
        mountain
    );


    /* -----------------------------------------------
       SNOW MESH
    ----------------------------------------------- */

    const snowGeometry =
        new THREE.ConeGeometry(
            width * 0.52,
            height * 0.40,
            segments,
            18
        );


    const snowPosition =
        snowGeometry.attributes.position;


    for (
        let i = 0;
        i < snowPosition.count;
        i++
    ) {

        const px =
            snowPosition.getX(i);

        const py =
            snowPosition.getY(i);

        const pz =
            snowPosition.getZ(i);


        const n =
            noise2D(
                px * 3,
                pz * 3
            );


        snowPosition.setX(
            i,
            px +
            n * 0.25
        );


        snowPosition.setZ(
            i,
            pz +
            n * 0.25
        );

    }


    snowGeometry.computeVertexNormals();


    const snowMaterial =
        new THREE.MeshStandardMaterial({

            color:
                0xe8eeee,

            roughness:
                0.82,

            metalness:
                0.01

        });


    const snow =
        new THREE.Mesh(
            snowGeometry,
            snowMaterial
        );


    snow.position.set(
        x,
        height * 0.78,
        z - 0.04
    );


    snow.rotation.y =
        rotation;


    mountains.add(
        snow
    );


    /* -----------------------------------------------
       DARK ROCK LAYER
    ----------------------------------------------- */

    const rockGeometry =
        new THREE.ConeGeometry(
            width * 0.75,
            height * 0.42,
            segments,
            12
        );


    const rockMaterial =
        new THREE.MeshStandardMaterial({

            color:
                0x252f34,

            roughness:
                1.0

        });


    const rock =
        new THREE.Mesh(
            rockGeometry,
            rockMaterial
        );


    rock.position.set(
        x,
        height * 0.18 - 1.2,
        z
    );


    rock.rotation.y =
        rotation;


    mountains.add(
        rock
    );

}


/* =========================================================
   DISTANT MOUNTAINS
========================================================= */

createMountain({
    x: -15,
    z: -35,
    width: 12,
    height: 17,
    rotation: 0.3,
    segments: 40
});


createMountain({
    x: -6,
    z: -40,
    width: 15,
    height: 23,
    rotation: -0.4,
    segments: 44
});


createMountain({
    x: 5,
    z: -43,
    width: 17,
    height: 26,
    rotation: 0.2,
    segments: 48
});


createMountain({
    x: 17,
    z: -37,
    width: 13,
    height: 20,
    rotation: -0.3,
    segments: 42
});


/* =========================================================
   MID MOUNTAINS
========================================================= */

createMountain({
    x: -12,
    z: -17,
    width: 8,
    height: 13,
    rotation: 0.5,
    segments: 42
});


createMountain({
    x: -4,
    z: -20,
    width: 9,
    height: 16,
    rotation: -0.2,
    segments: 44
});


createMountain({
    x: 6,
    z: -20,
    width: 11,
    height: 18,
    rotation: 0.3,
    segments: 46
});


createMountain({
    x: 15,
    z: -18,
    width: 9,
    height: 14,
    rotation: -0.5,
    segments: 42
});


/* =========================================================
   VALLEY TERRAIN
========================================================= */

const terrainGeometry =
    new THREE.PlaneGeometry(
        55,
        55,
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


    const largeNoise =
        noise2D(
            x * 0.35,
            y * 0.35
        );


    const smallNoise =
        noise2D(
            x * 1.1,
            y * 1.1
        );


    const elevation =
        largeNoise * 1.3 +
        smallNoise * 0.35;


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
            0x29382f,

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
    4
);


scene.add(
    terrain
);


/* =========================================================
   MOUNTAIN VALLEY ROAD
========================================================= */

const roadCurve =
    new THREE.CatmullRomCurve3([

        new THREE.Vector3(
            -2.5,
            -0.75,
            16
        ),

        new THREE.Vector3(
            1.2,
            -0.7,
            9
        ),

        new THREE.Vector3(
            -1.8,
            -0.65,
            2
        ),

        new THREE.Vector3(
            1.0,
            -0.6,
            -7
        ),

        new THREE.Vector3(
            -0.5,
            -0.55,
            -15
        )

    ]);


const roadGeometry =
    new THREE.TubeGeometry(
        roadCurve,
        80,
        0.48,
        8,
        false
    );


const roadMaterial =
    new THREE.MeshStandardMaterial({

        color:
            0x303536,

        roughness:
            0.92,

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

const roadLineMaterial =
    new THREE.LineBasicMaterial({

        color:
            0xc8b98c,

        transparent:
            true,

        opacity:
            0.65

    });


const roadPoints =
    roadCurve.getPoints(
        100
    );


const roadLineGeometry =
    new THREE.BufferGeometry()
        .setFromPoints(
            roadPoints
        );


const roadLine =
    new THREE.Line(
        roadLineGeometry,
        roadLineMaterial
    );


roadLine.position.y =
    0.51;


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
    new THREE.MeshStandardMaterial({

        color:
            0xffffff,

        transparent:
            true,

        opacity:
            0.13,

        roughness:
            1,

        depthWrite:
            false

    });


for (
    let i = 0;
    i < 20;
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
        2.8 +
        Math.random() * 2,
        0.5 +
        Math.random() * 0.3,
        1.2
    );


    cloud.position.set(
        (
            Math.random() -
            0.5
        ) * 45,

        5 +
        Math.random() * 10,

        -15 -
        Math.random() * 30
    );


    cloudGroup.add(
        cloud
    );

}


/* =========================================================
   SNOW
========================================================= */

const snowCount =
    window.innerWidth < 900
        ? 900
        : 2200;


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
        ) * 45;


    snowPositions[i + 1] =
        Math.random() * 25;


    snowPositions[i + 2] =
        (
            Math.random() -
            0.5
        ) * 45;

}


const snowGeometryParticles =
    new THREE.BufferGeometry();


snowGeometryParticles.setAttribute(
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
            0.72,

        depthWrite:
            false

    });


const snowfall =
    new THREE.Points(
        snowGeometryParticles,
        snowMaterialParticles
    );


scene.add(
    snowfall
);


/* =========================================================
   CAMERA CONTROL
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
   CINEMATIC ANIMATION
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
       CAMERA
    ----------------------------------------------- */

    camera.position.x =
        smoothX * 1.5;


    camera.position.y =
        3.8 -
        smoothY * 0.7 +
        Math.sin(
            time * 0.18
        ) * 0.15;


    camera.position.z =
        22 -
        Math.sin(
            time * 0.12
        ) * 2;


    camera.lookAt(
        0,
        3.5,
        -10
    );


    /* -----------------------------------------------
       CLOUD MOVEMENT
    ----------------------------------------------- */

    cloudGroup.position.x =
        Math.sin(
            time * 0.015
        ) * 2;


    cloudGroup.position.z =
        Math.cos(
            time * 0.01
        ) * 1.5;


    /* -----------------------------------------------
       SNOW MOVEMENT
    ----------------------------------------------- */

    const snowAttribute =
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
            snowAttribute.getX(
                index
            );


        let y =
            snowAttribute.getY(
                index
            );


        let z =
            snowAttribute.getZ(
                index
            );


        y -= 0.018;


        x +=
            Math.sin(
                time +
                i
            ) * 0.002;


        if (
            y < -2
        ) {

            y = 23;

            x =
                (
                    Math.random() -
                    0.5
                ) * 45;

            z =
                (
                    Math.random() -
                    0.5
                ) * 45;

        }


        snowAttribute.setXYZ(
            index,
            x,
            y,
            z
        );

    }


    snowAttribute.needsUpdate =
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


if (exploreButton) {

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
