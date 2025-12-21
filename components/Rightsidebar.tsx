import React from 'react'

const RightSidebar = ({
  user,
  transactions,
  banks
}: RightSidebarProps) => {
  return (
    <aside className="no-scrollbar hidden h-screen max-h-screen  flex-col border-l border-gray-200 xl:flex w-[355px] xl:overflow-y-scroll important!">
      <section className="flex flex-col pb-8!">
        <div className="h-[120px] w-full bg-gradient-mesh bg-cover bg-no-repeat" />
        <div className="relative px-6! flex max-xl:justify-center">
          <div className="profile-img">
            <span className='text-5xl font-bold text-neutral-900'>
              {user?.firstName[0]}
            </span>
          </div>
          <div className="lex flex-col pt-24!">
            <h1 className="text-24 font-semibold">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-16 font-normal text-gray-600">
              {user.email}
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-col justify-between gap-8 px-6! py-8!">
        <div className="flex w-full justify-between">
          <h2 className="header-2">

          </h2>
        </div>
      </section>
    </aside>
  )
}

export default RightSidebar