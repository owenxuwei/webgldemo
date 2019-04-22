import { Scene, DirectionalLight } from "three";

export class LightConfig{
     //添加平行光
   static AddDirectionalLight(scene :Scene){
    const directionalLight = new DirectionalLight(0xffffff);
    directionalLight.position.z = 100;
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 2;
    directionalLight.shadow.camera.far = 1000;
    directionalLight.shadow.camera.left = -1000;
    directionalLight.shadow.camera.right = 1000;
    directionalLight.shadow.camera.top = 1000;
    directionalLight.shadow.camera.bottom = -1000;
    // 设置阴影的分辨率
    directionalLight.shadow.mapSize.width = 2000;
    directionalLight.shadow.mapSize.height = 2000;
    scene.add(directionalLight);
  }
}