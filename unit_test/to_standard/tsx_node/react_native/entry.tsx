import {Text, View, Dimensions, Component} from 'react-native';

const {width} = Dimensions.get('window');
const r2p = x => (width / 750) * x;

export default class TestModule extends Component {

    render() {
        const isDarkMode = _getClosureResult() && Math.random() < 0.5;

        return (
            <View style={{...styles.container, backgroundColor: isDarkMode? "#000000" : "#FFFFFF"}}>
                <View style={styles.innerViewStyle}>
                    <Text>it's text</Text>
                </View>
                <View style={styles.innerViewStyle2}>
                    <Text>it's another text</Text>
                </View>
            </View>
        );


        function _getClosureResult() {
            var localFuncVarA = Date.now();
            return 50 + localFuncVarA;
        }

        function _unUsedFunc() {
            return 40;
        }
    }
  };
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: 'red',
      width: r2p(300) + r2p(100),
      height: r2p(100 + 50),
    },
    innerViewStyle: {
      backgroundColor: 'green',
      width: r2p(100),
    },
    innerViewStyle2: {
      backgroundColor: 'yellow',
      width: r2p(100) * 3,
    },
  });
  