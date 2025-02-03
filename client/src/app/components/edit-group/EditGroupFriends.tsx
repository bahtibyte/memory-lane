'use client';


export default function EditGroupFriends() {
  const getInitialLetter = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const getRandomPastelColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return `hsl(${h}, 70%, 85%)`;
  };

  return (
    <div className="bg-[#1A1A1A] border border-[#242424] rounded-lg p-4 md:p-6 mb-6">
      <h2 className="text-white font-medium mb-4">Friends</h2>
      <div className="mb-4 p-3 bg-purple-300/10 text-purple-300 rounded-lg text-sm">
        Feature work in progress. Friends does not work in this current release.
      </div>
      {/* Add New Friend Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-[#242424] rounded-lg mb-4">
        <div className="flex items-center gap-3 w-full">
          <div className="w-10 h-10 bg-purple-300/10 rounded-full flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-white">Add a New Friend</div>
            <div className="text-gray-400 text-sm">Click the button to send an invite</div>
          </div>
          <button className="px-6 py-2 bg-purple-300 text-black rounded-lg hover:bg-purple-400 hover:scale-105 hover:shadow-lg hover:shadow-purple-300/20 transition-all duration-200 whitespace-nowrap font-medium">
            Add Friend
          </button>
        </div>
      </div>

      {/* Friend List */}
      {[
        { name: 'Bahti', email: 'bahti@google.com', isAdmin: true },
        { name: 'Sigi', email: 'sigi@goldman.com', isAdmin: false },
        { name: 'Afshana', email: 'afshana@steam.com', isAdmin: false }
      ].map((friend, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-[#242424] rounded-lg mb-2 group">
          <div className="flex items-center gap-3 min-w-0">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium shrink-0"
              style={{ 
                backgroundColor: getRandomPastelColor(friend.name),
                color: '#1A1A1A'
              }}
            >
              {getInitialLetter(friend.name)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-white truncate">
                  {friend.name}
                </span>
                {friend.isAdmin && (
                  <span className="px-2 py-0.5 bg-purple-300/10 text-purple-300 rounded text-xs font-medium">
                    Admin
                  </span>
                )}
              </div>
              <div className="text-gray-400 text-sm truncate">{friend.email}</div>
            </div>
          </div>
          <div className="flex items-start gap-8">
            <button 
              onClick={() => {
                // Handle unfriend
              }}
              className="flex flex-col items-center w-[60px] gap-1.5 text-xs font-medium text-white hover:text-red-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
              </svg>
              <span className="whitespace-nowrap">Unfriend</span>
            </button>
            {!friend.isAdmin ? (
              <button 
                onClick={() => {
                  // Handle give admin
                }}
                className="flex flex-col items-center w-[60px] gap-1.5 text-xs font-medium text-red-400 hover:text-red-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="whitespace-nowrap">Give Admin</span>
              </button>
            ) : (
              <button 
                onClick={() => {
                  // Handle remove admin
                }}
                className="flex flex-col items-center w-[60px] gap-1.5 text-xs font-medium text-red-400 hover:text-red-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="whitespace-nowrap">Unadmin</span>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}