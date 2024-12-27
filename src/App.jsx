import { Provider } from 'react-redux'
import store from './redux/store'

function App() {
	return (
		<Provider store={store}>
			{/* Rest of your app components */}
		</Provider>
	)
}

export default App