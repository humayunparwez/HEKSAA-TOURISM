import * as THREE from
"https://unpkg.com/three@0.170.0/build/three.module.js";


/* =========================================
   BASIC SETUP
========================================= */

const canvas = document.getElementById("three-canvas");

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x030507);


/* =========================================
   CAMERA
========================================= */

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 0, 8);


/* =========================================
   RENDERER
========================================= */

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
});

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);


/* =========================================
   LIGHT
========================================= */

const ambientLight = new THREE.AmbientLight(
    0xffffff,
    0.5
);

scene.add(ambientLight);


const pointLight = new THREE.PointLight(
    0xffffff,
    15,
    30
);

pointLight.position.set(
    0,
    2,
    4
);

scene.add(pointLight);


/* =========================================
   3D INDIA PLACEHOLDER
========================================= */

const geometry = new THREE.IcosahedronGeometry(
    2.2,
    3
);

const material = new THREE.MeshStandardMaterial({
    color: 0x101820,
    metalness: 0.8,
    roughness: 0.35,

    wireframe: true
});


const india = new THREE.Mesh(
    geometry,
    material
);

india.position.set(
    2.5,
    0.3,
    -1
);

india.scale.set(
    1.1,
    1.1,
    1.1
);

scene.add(india);


/* =========================================
   PARTICLES
========================================= */

const particleCount = 1800;

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
        (Math.random() - 0.5) * 18;

    positions[i + 1] =
        (Math.random() - 0.5) * 10;

    positions[i + 2] =
        (Math.random() - 0.5) * 12;
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
        color: 0xffffff,
        size: 0.025,
        transparent: true,
        opacity: 0.55
    });


const particles =
    new THREE.Points(
        particleGeometry,
        particleMaterial
    );


scene.add(particles);


/* =========================================
   MOUSE / TOUCH
========================================= */

let targetX = 0;
let targetY = 0;


window.addEventListener(
    "pointermove",
    (event) => {

        targetX =
            (event.clientX /
                window.innerWidth -
                0.5) * 2;

        targetY =
            (event.clientY /
                window.innerHeight -
                0.5) * 2;

    }
);


/* =========================================
   ANIMATION
========================================= */

const clock = new THREE.Clock();


function animate() {

    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();


    /* INDIA */

    india.rotation.y =
        time * 0.12;

    india.rotation.x =
        Math.sin(time * 0.3) * 0.08;


    /* PARTICLES */

    particles.rotation.y =
        time * 0.015;


    /* CAMERA */

    camera.position.x +=
        (targetX * 0.35 -
            camera.position.x) * 0.02;

    camera.position.y +=
        (-targetY * 0.2 -
            camera.position.y) * 0.02;


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


/* =========================================
   RESIZE
========================================= */

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

    }
);


/* =========================================
   EXPLORE BUTTON
========================================= */

document
    .getElementById("exploreBtn")
    .addEventListener(
        "click",
        () => {

            document.body.style.transition =
                "opacity 1s ease";

            document.body.style.opacity =
                "0";

            setTimeout(() => {

                alert(
                    "India Explorer — Coming Next"
                );

                document.body.style.opacity =
                    "1";

            }, 1000);

        }
    );
