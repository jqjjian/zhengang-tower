import { View, Text, Image } from '@tarojs/components';
import './index.scss';
import { useState } from 'react';
import { RESOURCE_URL } from '@/config';
import Navbar from '@/components/NavBtns';
export default function ComponentDetailPage() {
    const [componentIndex, setComponentIndex] = useState<number>(0);
    // TODO: 在这里获取并处理需要展示的构件ID或其他信息
    // const componentId = Taro.getCurrentInstance().router?.params?.id;
    const componentDetail = [
        {
            title: '大鹏金翅',
            content: '它在佛教经典中被描述为一种神鸟，是佛的护法神祇（qí），象征着力量和速度，同时也是风神和云神的化身。在镇岗塔的浮雕中，大鹏金翅鸟的出现意味着它在守护着塔和其中的佛教圣物，同时也象征着塔的神圣不可侵犯'
        },
        {
            title: '文武官',
            content: '武士和文官的浮雕象征着保护和智慧。在佛教文化中，武士往往代表着力量和勇气，而文官则象征着知识和智慧。这样的组合可能意味着力量与智慧的结合，保护着塔和其中的佛教圣物。'
        },
        {
            title: '花卉',
            content: '塔基上有精美古朴的砖雕花饰。在拱眼壁上雕刻盛开的盆花，极为精细，展现了辽金时期的艺术风格。'
        },
        {
            title: '兽头',
            content: '兽头浮雕通常具有镇邪和守护的象征意义。在古代建筑中，兽头形象常被用于驱邪避灾，保护建筑及其所在区域的安全。同时展现了辽金时期砖雕艺术的精湛技艺。'
        },
        {
            title: '斗拱',
            content: '双杪(miǎo)五铺作斗拱是指在斗拱结构中，出两个华拱（杪），并且总共有五层铺作的斗拱。最下面的一层为大斗（栌（lú）斗），上面依次是两个华拱（或昂），一个耍头，以及一个衬方头，共计五铺作。双杪五铺'
        },
        {
            title: '佛龛一',
            content: '塔身第一层为双层楼阁式方塔，从第二层起为单层小塔，除第一层部分佛龛（kan）内雕饰假门假窗外，其余每座佛龛（kan）内端坐一尊佛像，形态各异，神态庄重，栩栩如生。第七层各塔均位于转角处且体量较大。前六层每层16座，第七层8座，共计104座。体现了古代工匠的精湛技艺。'
        },
        {
            title: '佛龛二',
            content: '塔身第一层为双层楼阁式方塔，从第二层起为单层小塔，除第一层部分佛龛（kan）内雕饰假门假窗外，其余每座佛龛（kan）内端坐一尊佛像，形态各异，神态庄重，栩栩如生。第七层各塔均位于转角处且体量较大。前六层每层16座，第七层8座，共计104座。体现了古代工匠的精湛技艺。'
        }

    ]
    return (
        <View className='component-detail-page'>
            <View className='component-detail-page-header'>
                <View className={`title title-${componentIndex + 1}`}></View>
            </View>
            <View className='component-detail-page-content'>
                <Image
                    src={`${RESOURCE_URL}/images/component-${componentIndex + 1}.webp`}
                    mode='widthFix'
                />
            </View>
            <View className='component-detail-page-content-text'>
                <p>
                    {componentDetail[componentIndex].content}
                </p>
            </View>
            <View className='component-detail-page-footer'>
                {componentDetail.map((item, index) => (
                    <View key={index} className={`footer-item ${componentIndex === index ? 'active' : ''}`} onClick={() => setComponentIndex(index)}>
                        {item.title}
                    </View>
                ))}
            </View>
            <Navbar customStyle={{ bottom: '310rpx' }} />
        </View>
    );
} 