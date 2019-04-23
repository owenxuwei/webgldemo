import { Scene, WebGLRenderer, PerspectiveCamera, Vector3, ArrowHelper, Color, Font, TextGeometry, Mesh, MeshBasicMaterial, OrthographicCamera, AdditiveBlending, MultiplyBlending, NormalBlending, NoBlending, SubtractiveBlending } from "three";
import { Quaternion } from "three";

class XYZ {
    type = "xyz";
    scene: Scene;
    camera: OrthographicCamera;
    font: Font;
    labelx:Mesh;
    labely: Mesh;
    labelz: Mesh;
    constructor(width: number, height: number, font: Font) {
        this.font = font;
        this.init(width, height);
    }

    init(width: number, height: number) {
        this.camera = new OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, - 99999, 99999);//相机

        this.scene = new Scene();

        var p = new Vector3(0, 0, 0);//坐标系三个方向箭头
        var arrowwith = Math.min(width,height) / 15;
        const arrowx = new ArrowHelper(new Vector3(1, 0, 0), p, arrowwith, 0, 8, 5);
        arrowx.setColor(new Color(1, 0, 0));
        this.scene.add(arrowx);
        const arrowy = new ArrowHelper(new Vector3(0, 1, 0), p, arrowwith, 0, 8, 5);
        arrowy.setColor(new Color(0, 1, 0));
        this.scene.add(arrowy);
        const arrowz = new ArrowHelper(new Vector3(0, 0, 1), p, arrowwith, 0, 8, 5);
        arrowz.setColor(new Color(0, 0, 1));
        this.scene.add(arrowz);

        const textoptions = {
            size: 10,
            height: 0,
            font: this.font, // “引用js字体必须换成英文”
            bevelThickness: 1,
            bevelSize: 1,
            bevelSegments: 1,
            curveSegments: 50,
            steps: 1
        }

        const x = new TextGeometry("x", textoptions);
        this.labelx = new Mesh(x, new MeshBasicMaterial({ color: new Color(1, 0, 0), depthTest: false }))
        this.labelx.position.set(arrowwith + 8, -3, 3);
        this.scene.add(this.labelx);

        const y = new TextGeometry("y", textoptions);
        this.labely = new Mesh(y, new MeshBasicMaterial({ color: new Color(0, 1, 0), depthTest: false }))
        this.labely.position.set(-3,arrowwith + 8, 3);
        this.scene.add(this.labely);

        const z = new TextGeometry("z", textoptions);
        this.labelz = new Mesh(z, new MeshBasicMaterial({ color: new Color(0, 0, 1), depthTest: false}))
        this.labelz.position.set(-3,-3, arrowwith + 8);
        this.scene.add(this.labelz);

        this.scene.position.set(-width *2/ 5, -height* 2/ 5, 0);
        this.scene.children.forEach(o1 => {
            o1.children.forEach((o: any) => {
                o.material.depthTest = false;//取消深度检测
                // o.material.blending = MultiplyBlending;
                // o.material.transparent = true;
            })
        });
        if(this.q) this.setRotationFromQuaternion(this.q);
    }

    public renderer(renderer: WebGLRenderer) {
        renderer.autoClear = false;
        renderer.render(this.scene, this.camera);
        renderer.autoClear = true;
    }

    q:Quaternion;
    setRotationFromQuaternion(q:Quaternion){
        this.q=q;
        this.scene.setRotationFromQuaternion(q);
        const qin = q.clone().inverse();
        this.labelx.setRotationFromQuaternion(qin);
        this.labely.setRotationFromQuaternion(qin);
        this.labelz.setRotationFromQuaternion(qin);
    }

}

export { XYZ }