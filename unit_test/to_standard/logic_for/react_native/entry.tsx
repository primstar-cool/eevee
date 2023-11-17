import {Text, View, Dimensions, Component} from 'react-native';

const {width} = Dimensions.get('window');
const r2p = x => (width / 750) * x;

export default class TestModule extends Component {


    state: {
      loopData: Array<{name: string, point: number}>
    } = {
      loopData:  [
        {name: 'aa', point: 2},
        {name: 'bb', point: 33}
      ],
    }

    render() {

        return (
            <View>
                {this.state.loopData.map(
                  (item, idx) => <Text>{"id:" + idx + ', name:' + item.name + ", pt: " + item.point}</Text>
                )}   

                {this.state.loopData.map(
                  function (item2)  {return <View><Text>{item2.name}</Text></View>}
                )}    

                {this.state.loopData.map(
                  function ()  {return <Text>empty</Text>}
                )}  

                {this.state.loopData.map(
                  function (item3)  {return <Text>{"nouse"}</Text>}
                )} 
            </View>
        );


    }
  };
  

