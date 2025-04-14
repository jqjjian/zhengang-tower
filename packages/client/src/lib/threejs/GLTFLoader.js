// 简化版GLTFLoader，适用于微信小程序环境
// 基于Three.js GLTFLoader修改
// 注意：这是一个极度简化版本，仅用于演示

class GLTFLoader {
    constructor(THREE) {
        this.THREE = THREE;
    }

    parse(data, path, onLoad, onError) {
        try {
            console.log('GLTFLoader: 开始解析模型');

            // 首先，检测数据类型
            if (data instanceof ArrayBuffer) {
                console.log('检测到二进制数据，尝试作为GLB格式解析');
                this._parseGLB(data, onLoad, onError);
            } else if (typeof data === 'string') {
                console.log('检测到字符串数据，尝试作为JSON解析');
                try {
                    const json = JSON.parse(data);
                    this._parseJSON(json, onLoad, onError);
                } catch (e) {
                    console.error('JSON解析失败:', e);
                    onError(e);
                }
            } else {
                console.log('未知数据类型:', typeof data);
                // 尝试将数据转换为字符串以进行调试
                let preview = '';

                if (data && data.toString) {
                    try {
                        preview = data.toString().substring(0, 50) + '...';
                    } catch (e) {
                        preview = '无法预览数据';
                    }
                }

                console.log('数据预览:', preview);
                onError(new Error('不支持的数据格式: ' + typeof data));
            }
        } catch (e) {
            console.error('GLTFLoader解析过程出错:', e);
            onError(e);
        }
    }

    _parseGLB(buffer, onLoad, onError) {
        try {
            if (!(buffer instanceof ArrayBuffer)) {
                console.error('GLB解析错误: 预期ArrayBuffer，实际获得', typeof buffer);
                onError(new Error('GLB解析错误: 无效的数据类型'));
                return;
            }

            // 检查GLB文件头以验证格式
            if (buffer.byteLength < 12) {
                console.error('GLB数据过小:', buffer.byteLength);
                onError(new Error('数据大小不足以识别为GLB格式'));
                return;
            }

            // 检查魔数是否为"glTF"
            const headerView = new Uint8Array(buffer, 0, 4);
            const magic = String.fromCharCode(headerView[0], headerView[1], headerView[2], headerView[3]);

            if (magic !== 'glTF') {
                console.error('GLB魔数不匹配:', magic);
                onError(new Error('无效的GLB格式: 魔数不匹配'));
                return;
            }

            console.log('验证为有效的GLB格式，创建自定义模型...');

            // 创建场景
            const scene = new this.THREE.Scene();

            // 创建一个更复杂的组合模型
            const group = new this.THREE.Group();

            // 基础几何体 - 立方体
            const cubeGeometry = new this.THREE.BoxGeometry(1, 1, 1);
            const cubeMaterial = new this.THREE.MeshStandardMaterial({
                color: 0x3498db,  // 蓝色
                metalness: 0.5,
                roughness: 0.5,
                wireframe: false,  // 确保不是线框
            });
            const cube = new this.THREE.Mesh(cubeGeometry, cubeMaterial);
            group.add(cube);

            // 顶部小球
            const sphereGeometry = new this.THREE.SphereGeometry(0.3, 24, 24);
            const sphereMaterial = new this.THREE.MeshStandardMaterial({
                color: 0x1abc9c,  // 青绿色
                metalness: 0.7,
                roughness: 0.3
            });
            const sphere = new this.THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.position.y = 0.8;
            group.add(sphere);

            // 底座
            const baseGeometry = new this.THREE.CylinderGeometry(0.7, 0.7, 0.2, 32);
            const baseMaterial = new this.THREE.MeshStandardMaterial({
                color: 0x2c3e50,  // 深蓝色
                metalness: 0.8,
                roughness: 0.2
            });
            const base = new this.THREE.Mesh(baseGeometry, baseMaterial);
            base.position.y = -0.6;
            group.add(base);

            scene.add(group);

            console.log('GLB模型创建成功');

            onLoad({
                scene: scene,
                animations: [],
                cameras: [],
                asset: { version: '2.0', generator: 'WebGL模拟GLB渲染' }
            });
        } catch (e) {
            console.error('GLB解析失败:', e);
            onError(e);
        }
    }

    _parseJSON(json, onLoad, onError) {
        try {
            console.log('解析JSON GLTF数据');

            // 简单验证JSON格式
            if (!json || typeof json !== 'object') {
                onError(new Error('无效的JSON数据'));
                return;
            }

            // 创建场景
            const scene = new this.THREE.Scene();

            // 创建一个显著不同的模型以区分JSON和GLB格式
            const group = new this.THREE.Group();

            // 主体 - 四面体
            const tetraGeometry = new this.THREE.TetrahedronGeometry(1);
            const tetraMaterial = new this.THREE.MeshStandardMaterial({
                color: 0xe74c3c,  // 红色
                metalness: 0.3,
                roughness: 0.7
            });
            const tetra = new this.THREE.Mesh(tetraGeometry, tetraMaterial);
            group.add(tetra);

            // 底座 - 较扁的圆盘
            const baseGeometry = new this.THREE.CylinderGeometry(1, 1, 0.1, 32);
            const baseMaterial = new this.THREE.MeshStandardMaterial({
                color: 0x95a5a6,  // 灰色
                metalness: 0.5,
                roughness: 0.5
            });
            const base = new this.THREE.Mesh(baseGeometry, baseMaterial);
            base.position.y = -0.8;
            group.add(base);

            scene.add(group);

            console.log('JSON模型创建成功');

            onLoad({
                scene: scene,
                animations: [],
                cameras: [],
                asset: { version: '2.0', generator: 'JSON-GLTF模拟渲染' }
            });
        } catch (e) {
            console.error('JSON解析失败:', e);
            onError(e);
        }
    }
}

export { GLTFLoader }; 