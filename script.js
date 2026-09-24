import * as THREE from
"https://unpkg.com/three@0.170.0/build/three.module.js";

import {
    feature
} from
"https://cdn.jsdelivr.net/npm/topojson-client@3/+esm";


/* =====================================================
   HEKSAA — 3D INDIA
===================================================== */

const canvas =
    document.getElementById("three-canvas");


/* =====================================================
   SCENE
===================================================== */

const scene =
    new THREE.Scene();

scene.background =
    new THREE.Color(0x030507);


/* =====================================================
   CAMERA
===================================================== */

const camera =
    new THREE.PerspectiveCamera(
        42,
        window.innerWidth /
        window.innerHeight,
        0.1,
        1000
    );

camera.position.set(
    0,
    0,
    8
);


/* =====================================================
   RENDERER
===================================================== */

const renderer =
    new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
    });

renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        1.5
    )
);

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);


/* =====================================================
   LIGHTING
===================================================== */

const ambientLight =
    new THREE.AmbientLight(
        0xffffff,
        0.65
    );

scene.add(ambientLight);


const keyLight =
    new THREE.DirectionalLight(
        0xffffff,
        2.5
    );

keyLight.position.set(
    -4,
    5,
    6
);

scene.add(keyLight);


const rimLight =
    new THREE.PointLight(
        0x8fb8ff,
        8,
        20
    );

rimLight.position.set(
    3,
    -2,
    4
);

scene.add(rimLight);


/* =====================================================
   INDIA GROUP
===================================================== */

const indiaGroup =
    new THREE.Group();

indiaGroup.position.set(
    2.4,
    0.2,
    -1
);

indiaGroup.rotation.z =
    THREE.MathUtils.degToRad(-3);

scene.add(indiaGroup);


/* =====================================================
   GEOJSON → THREE SHAPE
===================================================== */

function convertRing(
    ring,
    centerLon,
    centerLat,
    scale
) {

    const points = [];

    for (
        let i = 0;
        i < ring.length;
        i++
    ) {

        const lon =
            ring[i][0];

        const lat =
            ring[i][1];


        const x =
            (lon - centerLon) *
            scale;

        const y =
            (lat - centerLat) *
            scale;


        points.push(
            new THREE.Vector2(
                x,
                y
            )
        );
    }

    return points;
}


/* =====================================================
   CREATE INDIA
===================================================== */

async function createIndia() {

    try {

        const response =
            await fetch(
                "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
            );

        const topology =
            await response.json();


        /*
         * Country ID 356 = India
         */

        const countries =
            feature(
                topology,
                topology.objects.countries
            );


        const indiaFeature =
            countries.features.find(
                country =>
                    Number(country.id) === 356
            );


        if (!indiaFeature) {

            console.error(
                "India geometry not found."
            );

            return;
        }


        const geometry =
            indiaFeature.geometry;


        const centerLon = 78;

        const centerLat = 22;

        const scale = 0.075;


        /* =============================================
           HANDLE POLYGON / MULTIPOLYGON
        ============================================= */

        let polygons = [];


        if (
            geometry.type ===
            "Polygon"
        ) {

            polygons.push(
                geometry.coordinates
            );

        }


        if (
            geometry.type ===
            "MultiPolygon"
        ) {

            polygons =
                geometry.coordinates;
        }


        polygons.forEach(
            polygon => {

                const outerRing =
                    polygon[0];


                const shape =
                    new THREE.Shape();


                const points =
                    convertRing(
                        outerRing,
                        centerLon,
                        centerLat,
                        scale
                    );


                if (
                    points.length === 0
                ) {
                    return;
                }


                shape.moveTo(
                    points[0].x,
                    points[0].y
                );


                for (
                    let i = 1;
                    i < points.length;
                    i++
                ) {

                    shape.lineTo(
                        points[i].x,
                        points[i].y
                    );

                }


                shape.closePath();


                /* =====================================
                   3D EXTRUSION
                ===================================== */

                const extrudeSettings = {

                    depth: 0.18,

                    bevelEnabled: true,

                    bevelSegments: 2,

                    bevelSize: 0.025,

                    bevelThickness: 0.025

                };


                const geometry3D =
                    new THREE.ExtrudeGeometry(
                        shape,
                        extrudeSettings
                    );


                geometry3D.center();


                const material =
                    new THREE.MeshStandardMaterial({

                        color:
                            0x16202b,

                        metalness:
                            0.75,

                        roughness:
                            0.28,

                        transparent:
                            true,

                        opacity:
                            0.95

                    });


                const mesh =
                    new THREE.Mesh(
                        geometry3D,
                        material
                    );


                indiaGroup.add(
                    mesh
                );


                /* =====================================
                   GLOWING WIREFRAME
                ===================================== */

                const edges =
                    new THREE.EdgesGeometry(
                        geometry3D
                    );


                const edgeMaterial =
                    new THREE.LineBasicMaterial({

                        color:
                            0x7897b5,

                        transparent:
                            true,

                        opacity:
                            0.45

                    });


                const edgeLines =
                    new THREE.LineSegments(
                        edges,
                        edgeMaterial
                    );


                indiaGroup.add(
                    edgeLines
                );

            }
        );


        /* =============================================
           INDIA GLOW
        ============================================= */

        const glowGeometry =
            new THREE.CircleGeometry(
                2.3,
                64
            );


        const glowMaterial =
            new THREE.MeshBasicMaterial({

                color:
                    0x315b80,

                transparent:
                    true,

                opacity:
                    0.055,

                side:
                    THREE.DoubleSide

            });


        const glow =
            new THREE.Mesh(
                glowGeometry,
                glowMaterial
            );


        glow.position.z =
            -0.15;


        indiaGroup.add(
            glow
        );


        console.log(
            "HEKSAA 3D INDIA LOADED"
        );


    } catch (error) {

        console.error(
            "Could not load India:",
            error
        );

    }

}


/* =====================================================
   PARTICLES
===================================================== */

const particleCount =
    window.innerWidth < 700
        ? 900
        : 1600;


const particleGeometry =
    new THREE.BufferGeometry();


const positions =
    new Float32Array(
        particleCount * 3
    );


for (
    let i = 0;
    i < particleCount * 3;
    i += 3
) {

    positions[i] =
        (Math.random() - 0.5) *
        18;

    positions[i + 1] =
        (Math.random() - 0.5) *
        10;

    positions[i + 2] =
        (Math.random() - 0.5) *
        12;

}


particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
        positions,
        3
    )
);


const particleMaterial =
    new THREE.PointsMaterial({

        color:
            0xffffff,

        size:
            window.innerWidth < 700
                ? 0.018
                : 0.025,

        transparent:
            true,

        opacity:
            0.5

    });


const particles =
    new THREE.Points(
        particleGeometry,
        particleMaterial
    );


scene.add(
    particles
);


/* =====================================================
   TOUCH / MOUSE
===================================================== */

let targetX = 0;

let targetY = 0;


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


/* =====================================================
   ANIMATION
===================================================== */

const clock =
    new THREE.Clock();


function animate() {

    requestAnimationFrame(
        animate
    );


    const time =
        clock.getElapsedTime();


    /* INDIA ROTATION */

    indiaGroup.rotation.y +=
        0.0015;


    indiaGroup.rotation.x +=
        (
            targetY * 0.05 -
            indiaGroup.rotation.x
        ) * 0.025;


    indiaGroup.rotation.z +=
        (
            -3 *
            Math.PI /
            180 +
            targetX * 0.08 -
            indiaGroup.rotation.z
        ) * 0.025;


    /* FLOATING */

    indiaGroup.position.y =
        0.2 +
        Math.sin(
            time * 0.8
        ) * 0.06;


    /* PARTICLES */

    particles.rotation.y =
        time * 0.008;


    particles.rotation.x =
        Math.sin(
            time * 0.1
        ) * 0.02;


    /* CAMERA PARALLAX */

    camera.position.x +=
        (
            targetX * 0.25 -
            camera.position.x
        ) * 0.02;


    camera.position.y +=
        (
            -targetY * 0.15 -
            camera.position.y
        ) * 0.02;


    camera.lookAt(
        0,
        0,
        0
    );


    renderer.render(
        scene,
        camera
    );

}


animate();


/* =====================================================
   LOAD INDIA
===================================================== */

createIndia();


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
                1.5
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


exploreButton.addEventListener(
    "click",
    () => {

        exploreButton.innerHTML =
            `
            <span>ENTERING INDIA</span>
            <span class="arrow">→</span>
            `;


        indiaGroup.scale.set(
            1.2,
            1.2,
            1.2
        );


        camera.position.z =
            6;


        setTimeout(
            () => {

                alert(
                    "INDIA EXPLORER — NEXT STAGE"
                );

            },
            1000
        );

    }
);
