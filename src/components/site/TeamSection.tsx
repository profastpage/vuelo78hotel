import type { TeamMember } from "@/types/site";
import { renderBalancedSectionTitle } from "./headline-balance";

type TeamSectionProps = {
  title?: string;
  description?: string;
  members: TeamMember[];
};

export function TeamSection({ title, description, members }: TeamSectionProps) {
  if (!members || members.length === 0) return null;

  return (
    <section
      className="scene scene-team"
      id="equipo"
      data-animate
      data-editor-section="team"
    >
      <div className="section-copy" data-animate>
        <span className="scene-chip">Nuestro equipo</span>
        {title ? <h2 className="section-title">{renderBalancedSectionTitle(title)}</h2> : null}
        {description ? <p>{description}</p> : null}
      </div>

      <div className="team-grid">
        {members.map((member, index) => (
          <article
            className="team-card"
            key={member.name}
            data-animate
            data-animate-delay={String(index * 70)}
          >
            <div className="team-avatar">
              {member.avatarSrc ? (
                <img
                  src={member.avatarSrc}
                  alt={`Foto de ${member.name}`}
                  loading="lazy"
                />
              ) : (
                <span className="team-avatar-fallback" aria-hidden="true">
                  {member.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="team-copy">
              <strong>{member.name}</strong>
              <span>{member.role}</span>
              {member.bio ? <p>{member.bio}</p> : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
