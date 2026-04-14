export default function TabBar({ tabs, active, onChange }) {
  return (
    <div className="tabbar">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`tab-btn ${active === tab ? 'active' : ''}`}
          onClick={() => onChange(tab)}
        >
          {tab === 'Discover' && '🔍 '}
          {tab === 'Account' && '👤 '}
          {tab === 'Customer' && '📋 '}
          {tab === 'Admin' && '⚙️ '}
          {tab}
        </button>
      ))}
    </div>
  );
}
