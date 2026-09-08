import Sidebar from './components/Sidebar/Sidebar'
import MainContent from './components/MainContent/MainContent'

export default function App() {
  return (
    <div className="bg-surface-container-low text-on-surface h-screen w-screen overflow-hidden flex font-body-md">
      <Sidebar />
      <MainContent />
    </div>
  )
}