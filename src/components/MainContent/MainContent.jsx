import TopBar from './TopBar'
import HeroSection from './HeroSection'
import PinnedChats from './PinnedChats'
import ChatInput from './ChatInput'

export default function MainContent() {
  return (
    <div className="flex-1 h-full bg-background flex flex-col relative overflow-hidden">
      <TopBar />

      {/* Main Content Scroll Area */}
      <div className="flex-1 overflow-y-auto px-8 pt-24 pb-48 flex flex-col items-center custom-scrollbar">
        <HeroSection />
        <PinnedChats />
      </div>

      <ChatInput />
    </div>
  )
}
