import TopBar from './TopBar'
import HeroSection from './HeroSection'
import ChatInput from './ChatInput'

export default function MainContent({ onToggleSidebar }) {
  return (
    <div className="flex-1 min-w-0 h-full flex flex-col relative overflow-hidden">
      <TopBar onToggleSidebar={onToggleSidebar} />

      {/* Centered Content - vertically centered in viewport */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 md:px-8 pt-16">
        <div className="w-full max-w-3xl flex flex-col items-center">
          <HeroSection />
          <div className="w-full mt-8 md:mt-12 flex justify-center">
            <ChatInput />
          </div>
        </div>
      </div>
    </div>
  )
}