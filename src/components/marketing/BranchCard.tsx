import { Clock, Mail, MapPin, Navigation, Phone } from "lucide-react";
import type { Branch } from "@/data/marketing/branches";

export function BranchCard({ branch }: { branch: Branch }) {
  return (
    <article className="mkt-branch-card">
      <div className="mkt-branch-head">
        <div>
          <h3>{branch.city}</h3>
          <p>{branch.state}</p>
        </div>
        {branch.isSample ? <span className="mkt-sample-badge">Sample</span> : null}
      </div>
      <ul className="mkt-branch-meta">
        <li><MapPin aria-hidden /> {branch.address}</li>
        <li><Phone aria-hidden /> <a href={`tel:${branch.phone.replace(/\s/g, "")}`}>{branch.phone}</a></li>
        <li><Mail aria-hidden /> <a href={`mailto:${branch.email}`}>{branch.email}</a></li>
        <li><Clock aria-hidden /> {branch.workingHours}</li>
      </ul>
      <a href={branch.mapUrl} target="_blank" rel="noopener noreferrer" className="mkt-branch-map">
        <Navigation aria-hidden /> Get Directions
      </a>
    </article>
  );
}
