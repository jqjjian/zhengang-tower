import { useState, useEffect } from 'react'
import { View, Text, Image } from '@tarojs/components'
import { useDidShow, useDidHide } from '@tarojs/taro'
import { RESOURCE_URL } from '@/config'
import './index.scss'

export default function CulturalKnowledge() {
    const [activeIndex, setActiveIndex] = useState(0)
    const [menuList, setMenuList] = useState([
        {
            menuName: '镇岗塔传说',
            title: '镇岗塔的传说'
        },
        {
            menuName: '镇岗塔构造',
            title: '镇岗塔的构造'
        },
        {
            menuName: '镇岗塔修缮',
            title: '镇岗塔修缮历程'
        },
        {
            menuName: '镇岗塔古今',
            title: '镇岗塔的古今延展'
        },
        {
            menuName: '镇岗塔焕新',
            title: '镇岗塔焕新'
        },
        {
            menuName: '镇岗塔知天下',
            title: '一塔知天下'
        }
    ])
    // 组件挂载时执行
    useEffect(() => {
        console.log('文化知识页面加载')

        return () => {
            console.log('文化知识页面卸载')
        }
    }, [])

    // Taro 特有的生命周期 Hooks
    useDidShow(() => {
        console.log('文化知识页面显示')
    })

    useDidHide(() => {
        console.log('文化知识页面隐藏')
    })


    return (
        <View className='cultural-knowledge'>
            <View className='header'>
                {menuList[activeIndex].title}
            </View>


            <View className='knowledge-list'>
                {activeIndex === 0 && <View className='knowledge-item tower-chuanshuo'>
                    <p>
                        关于镇岗塔的由来，流传着多个传说。流传最广的传说是该塔所在土岗为龙脉，葬于此可福泽后代，引得附近人家竞相挖穴建墓。统治者闻讯后，为保江山稳固，于该地修建崇寿寺并建塔镇压，称之为"镇岗塔"。崇寿寺今已不存，唯塔独留。
                    </p>
                    <p>
                        另有宝塔镇河妖、镇杀蜘蛛精、王公下马寻蛐蛐等传说趣事，让镇岗塔充满神奇色彩。
                    </p>
                    <View className='tower-image'>
                        <Image src={`${RESOURCE_URL}/images/tower.webp`} />
                    </View>
                </View>}
                {activeIndex === 1 && <View className='knowledge-item'>
                    <p>
                        镇岗塔位于北京市丰台区云岗街道镇岗塔路东侧高地处，为外包砖内夯（hang）土实心华塔。
                    </p>
                    <View className='tower2-info'>
                        <p>
                            坐北朝南，下部呈八角形
                        </p>
                        <p>
                            上部逐渐内收呈锥形
                        </p>
                        <p>
                            高20.815米，底部边长3.3米
                        </p>

                    </View>
                    <p>
                        该塔造型优美，敦实庄重，雕刻古朴生动，呈现出典型的辽金古塔风格，具有很高的历史价值与艺术价值。
                    </p>
                    <View className='tower-image tower-2'>
                        <Image src={`${RESOURCE_URL}/images/wish-tower.webp`} />
                    </View>
                    <p>
                        华塔是对佛教《华严经》中所描绘的华藏世界的立体表现，因其独特造型犹如盛开的莲花或待放的莲苞而被称为花塔，是北方地区出现的一种造型极为特别的建筑，流行于宋、辽、金时期，元代以后逐渐绝迹，实为中国古代建筑艺术中的一朵奇葩。北京现存花塔2座 （丰台区镇岗塔、房山区万佛堂花塔），全国也仅存十几座。
                    </p>
                    <p>
                        镇岗塔底部塔基为八角截锥形高台，高台顶部转角处用砖雕出仿木圆柱，柱间每面有三组浮雕（现仅存西北面大鹏金翅鸟、两文官、两武官浮雕），线条雕刻木实有力，人物面部表情极为生动。柱头设普柏枋和阑额，其上置斗拱。斗拱分为两种：八角各有转角铺作 （亦为柱头铺作）一攒（cudn），柱间设补间铺作一攒。拱眼壁刻有花卉、兽头等精美古朴浮雕。斗拱上承托平座，平座雕刻菱花格纹（现由青砖替代）。平座上再施束腰仰覆莲式须弥座，以承托塔身。
                    </p>
                    <View className='tower-image tower-2-1'>
                        <Image src={`${RESOURCE_URL}/images/tower-2-1.jpg`} />
                    </View>
                    <p>
                        塔身分为上下两大部分。下部塔身为八角仿木楼阁式，每面一开间，四正面辟拱券门，四维面砌破子棂 （ling）窗，转角砌倚柱，柱脚间有地袱（fu），柱头间有阑额、普柏枋，柱两侧有抱框。券门上雕刻内容极为丰富，雕饰图案各不相同，上槛有门簪两枚，菱花格子门搭配竖向条纹障水板。塔身挑出短檐，筒瓦屋面， 塔檐各角原有铜铃悬挂，现已佚失。檐下施以斗拱，形制与平座斗拱相同。拱眼壁上浮雕花卉及动物造型，活灵活现，造型逼真。檐上置仰莲座，座上承托多层佛龛式影作建筑。
                    </p>
                    <p>
                        上部塔身形如巨大的莲苞，其表面自下而上逐渐内收，并环绕相错地密布七层共三组影作建筑。最下层为一组，其是以连廊相互衔接而形成的一宽两窄形式之重层楼阁。四正方位的楼阁为中央主体，其形态略宽并雕饰假门假窗；四维方位的楼阁为辅且为四主楼所共用；主次之间以象征连廊的横砖相互连接。第二至第六层为第二组，其均为龛形塔身的单层亭式方塔。龛形塔身内均端坐一尊佛像，有的双手合十，有的两手上举，有的一手平伸，形态各异，神态庄重，栩栩如生。第七层为第三组，各塔均位于转角处且体量较大。前六层每层16 座，第七层8座，共计104座。
                    </p>
                    <p>
                        再上接塔刹，为采用叠涩方式的十三层相轮，其上置须弥座并承托宝珠。
                    </p>
                </View>}
                {activeIndex === 2 && <View className='knowledge-item'>
                    <View className='timeline-container'>
                        <View className='timeline-header'>
                            <p style={{ textIndent: 0 }}>
                                始建于辽金时期。
                            </p>
                            <p style={{ textIndent: 0 }}>
                                明嘉靖四十年（1561年），重修镇岗塔。
                            </p>
                            <p style={{ textIndent: 0 }}>
                                民国年间，塔已残破，而且自然风化严重，满目疮痍。
                            </p>
                            <p style={{ textIndent: 0 }}>
                                抗日战争时期，日军为从塔中取宝曾多次以塔为靶发射炮弹，同时在塔下埋炸药将塔基炸开1米深的洞，塔身只受到轻度损伤，依然屹立不倒。
                            </p>
                        </View>

                        <View className='timeline'>
                            <View className='timeline-item'>
                                <View className='timeline-point'></View>
                                <View className='timeline-content'>
                                    <View className='timeline-year'>1957年</View>
                                    <View className='timeline-desc'>
                                        镇岗塔被公布为第一批北京市文物保护单位。
                                    </View>
                                </View>
                            </View>

                            <View className='timeline-item'>
                                <View className='timeline-point'></View>
                                <View className='timeline-content'>
                                    <View className='timeline-year'>1958年</View>
                                    <View className='timeline-desc'>
                                        对镇岗塔进行修整，补砌了被毁的部分塔基，恢复了佛龛的原有风貌。
                                    </View>
                                </View>
                            </View>

                            <View className='timeline-item'>
                                <View className='timeline-point'></View>
                                <View className='timeline-content'>
                                    <View className='timeline-year'>1982年</View>
                                    <View className='timeline-desc'>
                                        重修塔基和避雷针，并加固塔下的护坡。
                                    </View>
                                </View>
                            </View>

                            <View className='timeline-item'>
                                <View className='timeline-point'></View>
                                <View className='timeline-content'>
                                    <View className='timeline-year'>2001年</View>
                                    <View className='timeline-desc'>
                                        再次重修镇岗塔，同时对塔周围的设施和环境进行全方位的保护。
                                    </View>
                                </View>
                            </View>

                            <View className='timeline-item'>
                                <View className='timeline-point'></View>
                                <View className='timeline-content'>
                                    <View className='timeline-year'>2013年</View>
                                    <View className='timeline-desc'>
                                        被国务院公布为第七批全国重点文物保护单位。
                                    </View>
                                </View>
                            </View>

                            <View className='timeline-item'>
                                <View className='timeline-point'></View>
                                <View className='timeline-content'>
                                    <View className='timeline-year'>2021年</View>
                                    <View className='timeline-desc'>
                                        丰台区行政区划调整，镇岗塔隶属管理使用单位张家坟村—并由原长辛店镇岗塔整至云岗街道。
                                    </View>
                                </View>
                            </View>

                            <View className='timeline-item'>
                                <View className='timeline-point'></View>
                                <View className='timeline-content'>
                                    <View className='timeline-year'>2022年</View>
                                    <View className='timeline-desc'>
                                        丰台区园林绿化局启动镇岗塔留白增绿景观项目，结合镇岗塔周边林地，打造塔下休闲广场。丰台区云岗街道补充资金用于建设停车场和平整道路，提升市民休闲游览便利性。
                                    </View>
                                </View>
                            </View>

                            <View className='timeline-item'>
                                <View className='timeline-point'></View>
                                <View className='timeline-content'>
                                    <View className='timeline-year'>2024年</View>
                                    <View className='timeline-desc'>
                                        对镇岗塔进行保护修缮和安全监测，丰台区云岗街道组织实施"镇岗塔点亮工程"项目，举办点亮仪式和"千年镇岗塔·多彩航天城"点亮之夜音乐会，重塑古塔夜形象，为京西云岗航天城增添夜休闲文化新地标。点亮仪式和点亮之夜音乐会得到社会各界广泛关注和重视，北京广播电视台等媒体对活动进行了报道。
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* <View className='timeline-footer'>
                            <View className='back-button'>
                                <Image src={`${RESOURCE_URL}/images/back-arrow.webp`} />
                                返回
                            </View>
                            <View className='more-info'>
                                向上滑动查看更多
                            </View>
                        </View> */}
                    </View>
                </View>}
                {activeIndex === 3 && <View className='knowledge-item tower-gujin'>
                    <View className='box box-1'>
                        <View className='box-title'>
                            重修镇岗古塔碑
                        </View>
                        <p>
                            明代嘉靖四十年（1561年）曾对镇岗塔进行重修，并在塔前立有《重修镇岗古塔碑记》石碑，现已无存。
                        </p>
                        <p>
                            根据国家图书馆所存拓片记载：额书“重修镇岗古塔碑记”，大致记载如下：“京师西山原有宝塔名日镇岗， 不计时代，年深日久，坍塌颓毁，不 （易）观瞻，呈祥现瑞，时常放光，凌云（霄）汉，舍利中藏。”
                        </p>
                    </View>
                    <View className='box box-2'>
                        <View className='box-title'>
                            天仙庵（an）铁钟
                        </View>
                        <p>
                            镇岗塔前原有明代天启六年（1626年）制的大铁钟，铁钟造型古朴，纹饰精美，不仅体现了古代铸造工艺的高超水平，还蕴含着丰富的文化内涵和象征意义。
                        </p>
                        <p>
                            通过详细解读铁钟上的铭文和图案，可以更加深入地了解其历史背景和文化价值，比如钟身提供了铸钟工匠和捐资人的具体信息，反映出当时佛教信仰的普及程度、！ 民间捐赠文化的存在以及工匠技艺的传承情况。此铁钟目前已被移至北京市海淀区大钟寺古钟博物馆收藏。
                        </p>
                    </View>
                    <View className='box box-3'>
                        <View>
                            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                <View className='box-title'>
                                    崇寿寺与天仙庵
                                </View>
                            </View>
                            <p>
                                镇岗塔本身是一座具有800多年历史的辽金佛塔，曾与附近的崇寿寺密切相关，明代“重修镇岗古塔碑记”记载“塔下有寺乃日崇寿”，但如今寺庙已不复存在，仅留下古塔作为历史见证。
                            </p>
                            <p>
                                天仙庵铁钟上的铭文“捐资人：天仙庵僧人“和当地曾传唱的民间童谣”镇岗塔，白云飘，五尺大钟浪娘庙”，印证了镇岗塔周边曾存在着一座天仙庵，同崇寿寺一样，如今庵已不存。
                            </p>

                        </View>
                    </View>
                </View>}
                {activeIndex === 4 && <View className='knowledge-item tower-huanxin'>
                    <p>
                        镇岗塔历经800多年风箱雨雪，承载着厚重的历史底蕴，见证了时代的发展、首都京西的变迁和航天强国的建设。作为云岗地区独特的历史遗迹，镇岗塔早已成为云岗人心中保护家园的文化象征。
                    </p>
                    <View className='tower-image tower-2-1'>
                        <Image src={`${RESOURCE_URL}/images/tower-5-1.webp`} />
                    </View>
                    <p>
                        近年来，通过镇岗塔“留白增绿”景观项目，建设了镇岗塔公园和塔下休闲广场，为周边居民提供了日常休闲娱乐的场所，增进了百姓福祉；平整后的道路和停车场为远途游客增加了游览的便利性，人流量与日俱增。

                        “点亮镇岗塔”项目，重塑古塔夜形象，为京西云岗航天城增添夜休闲文化新地标。”千年镇岗塔•多彩航天城” 点亮仪式和点亮之夜音乐会的成功举办，让镇岗塔成功 “破圈”，得到社会各界广泛关注，使其在新时代绽放出新的光彩！
                    </p>
                    <View className='image-box'>
                        <View className='tower-image'>
                            <Image src={`${RESOURCE_URL}/images/tower-5-2.webp`} mode='widthFix' />
                        </View>
                        <View className='tower-image'>
                            <Image src={`${RESOURCE_URL}/images/tower-5-3.webp`} mode='widthFix' />
                        </View>
                    </View>
                    <p>
                        镇岗塔作为云岗地区的文化符号，见证了云岗的历史变迁。它不仅是古建筑艺术的代表，也是居民精神文化的重要载体。它横跨历史长河，连接着过去与当下， 在岁月的沉淀中，让人深刻领略到本地文化的独特魅力与深厚底蕴，激发起当地居民强烈的认同感与归属感， 成为凝聚人心、传承文脉的重要力量。
                    </p>
                </View>}
                {activeIndex === 5 && <View className='knowledge-item tower-zhitian'>
                    <p>
                        辽金时期的砖塔主要分为楼阁式、密檐式和复合式覆钵塔等。其中，楼阁式塔多为八角形，塔身较高，内部可能设置塔梯供登临；密檐式塔则以多层密檐为特点，造型紧凑。
                    </p>
                    <p>
                        塔座是辽金砖塔的重要特征，通常建在夯 （hang）土台基上，塔座由砖雕须弥座、仿木平坐铺作、砖构勾阑（Ian）等组成。
                    </p>
                    <p>
                        塔身常见砖雕佛像、菩萨、力士等佛教题材，以及仿木构的斗拱、门窗等。例如，万部华严经塔的塔身有精美的砖雕佛像，造型生动。
                    </p>
                    <p>
                        部分塔的塔身还装饰有天宫楼阁等小木作建筑模型，如昌黎源影塔，其砖雕构图独特，堪称一绝。
                    </p>
                    <p>
                        辽金时期，佛教盛行，砖塔作为佛教建筑的重要形式，承载了宗教信仰和文化传承的功能。塔内常设有塔心室或塔宫，用于供奉佛像或瘗葬舍利。
                    </p>
                    <View className='title'>
                    </View>
                    <View className='box'>
                        <View className='box-info'>
                            <View className='box-info-title title-1'>
                                万部华严经塔（白塔）
                            </View>
                            <View className='box-info-desc'>
                                <p>
                                    位于内蒙古呼和浩特市，建于辽圣宗时期。塔为八角七层楼阁式砖塔，高50米，塔身有精美的砖雕佛像和仿木构斗拱。
                                </p>
                                <p>
                                    塔内有旋转式阶梯，塔座部分埋入地下，上部砌作仰莲瓣。
                                </p>
                            </View>
                        </View>
                        <View className='box-image'>
                        </View>
                    </View>
                    <View className='box'>
                        <View className='box-info'>
                            <View className='box-info-title title-2'>
                                辽阳白塔
                            </View>
                            <View className='box-info-desc'>
                                <p>
                                    位于辽宁省辽阳市，是八角十三层密檐式砖塔，高70.4米。
                                </p>
                                <p>
                                    塔身逐层内收，檐角悬风铃，塔顶有铜制的相轮和宝珠。
                                </p>
                            </View>
                        </View>
                        <View className='box-image'>
                        </View>
                    </View>
                    <View className='box'>
                        <View className='box-info'>
                            <View className='box-info-title '>
                                麻衣寺砖塔
                            </View>
                            <View className='box-info-desc'>
                                <p>
                                    位于山西省安泽县，建于金代大定十七年、（1177年），是保存最完整的辽金砖塔之一。
                                </p>
                                <p>
                                    塔为九层楼阁式，平面八角形，塔身有大量砖雕佛像和仿木构斗拱。
                                </p>
                            </View>
                        </View>
                        <View className='box-image'>
                        </View>
                    </View>
                    <View className='box'>
                        <View className='box-info'>
                            <View className='box-info-title'>
                                圆觉寺砖塔
                            </View>
                            <View className='box-info-desc'>
                                <p>
                                    位于山西省浑源县，建于辽末金初（1158年），是大同地区现存唯一的密檐塔。
                                </p>
                                <p>
                                    塔高30多米，八角九层， 全部砖砌，塔基为高达4米的须弥座。
                                </p>
                            </View>
                        </View>
                        <View className='box-image'>
                        </View>
                    </View>
                    <View className='box'>
                        <View className='box-info'>
                            <View className='box-info-title'>
                                昌黎源影塔
                            </View>
                            <View className='box-info-desc'>
                                <p>
                                    位于河北省昌黎县，为八角十三层密檐式砖塔，高30米。
                                </p>
                                <p>
                                    塔身第 80.71% 层有独特的砖雕天宫楼阁，是现存古塔中罕见的装饰风格。
                                </p>
                            </View>
                        </View>
                        <View className='box-image'>
                        </View>
                    </View>
                </View>}
            </View>

            <View className='footnote'>
                {menuList.map((item, index) => (
                    <View key={index} className={`menu-item ${activeIndex === index ? 'active' : ''}`} onClick={() => setActiveIndex(index)}>{item.menuName}</View>
                ))}
                {/* <View className={`menu-item ${activeIndex === 2 ? 'active' : ''}`} onClick={() => setActiveIndex(2)}>镇岗塔修缮</View>
                <View className={`menu-item ${activeIndex === 3 ? 'active' : ''}`} onClick={() => setActiveIndex(3)}>镇岗塔古今</View>
                <View className={`menu-item ${activeIndex === 4 ? 'active' : ''}`} onClick={() => setActiveIndex(4)}>镇岗塔焕新</View>
                <View className={`menu-item ${activeIndex === 5 ? 'active' : ''}`} onClick={() => setActiveIndex(5)}>镇岗塔知天下</View> */}
            </View>
        </View>
    )
} 