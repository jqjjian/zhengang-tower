import { View, Text } from '@tarojs/components';

export default function TagBtn(props: {
    onClick: () => void;
    className?: string;
    children?: React.ReactNode;
}) {
    return (
        <View  {...props} className={`tag-btn ${props.className}`}>
            <Text className='tag-btn-text'>{props.children}</Text>
        </View>
    )
}