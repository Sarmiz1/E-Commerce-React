import { NavLink } from "react-router-dom";

export default function Footer() {
  return (
    <section className="flex gap-4 flex-col justify-center pt-10 px-10 bg-slate-200 dark:bg-slate-400">
      <div className="flex flex-col md:flex-row  justify-center md:justify-start items-center md:items-start gap-4 mb-8">

        <ul className=" md:mr-auto sm:ml-10 md:ml-0 mb-2 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-1 gap-4">
          <li className="hover:text-slate-100"><NavLink>Facebook</NavLink></li>
          <li className="hover:text-slate-100"><NavLink>Instagram</NavLink></li>
          <li className="hover:text-slate-100"><NavLink>Twitter</NavLink></li>
          <li className="sm:-ml-4 md:-ml-0 hover:text-slate-100"><NavLink>Tiktok</NavLink></li>
        </ul>

        <ul className="flex gap-4">
          <li className="hover:text-slate-100">
            <NavLink>Contact</NavLink>
          </li >
          <li className="hover:text-slate-100">
            <NavLink>About</NavLink>
          </li>
          <li className="hover:text-slate-100">
            <NavLink>Support</NavLink>
          </li>
          <li className="hover:text-slate-100">
            <NavLink>FAQ</NavLink>
          </li>
        </ul>
      </div>

      <p className="text-center mb-1">&copy; 2026  ShopMart. All rights reserved.</p>
    </section>
  );
}