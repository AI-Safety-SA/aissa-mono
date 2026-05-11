export type PartnerLogoCardProps = {
  href?: string | null;
  imageAlt?: string | null;
  imageSrc?: string | null;
  name?: string | null;
};

export function PartnerLogoCard({
  href,
  imageAlt,
  imageSrc,
  name,
}: PartnerLogoCardProps) {
  const trimmedName = name?.trim();
  const accessibleLabel = trimmedName || imageAlt || "Partner";
  const logoWellClassName = trimmedName
    ? "partner-logo-card__logo ui:flex ui:h-24 ui:w-full ui:items-center ui:justify-center ui:px-5 ui:py-4"
    : "partner-logo-card__logo ui:flex ui:h-32 ui:w-full ui:items-center ui:justify-center ui:px-5 ui:py-5";

  const content = (
    <>
      <span className={logoWellClassName}>
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={imageAlt || (trimmedName ? `${trimmedName} logo` : "")}
            className="ui:max-h-16 ui:w-auto ui:max-w-full ui:object-contain"
            loading="lazy"
          />
        ) : (
          <span className="ui:flex ui:h-12 ui:w-12 ui:items-center ui:justify-center ui:rounded-md ui:bg-muted ui:text-lg ui:font-semibold ui:text-muted-foreground">
            {trimmedName
              ? trimmedName.charAt(0).toUpperCase()
              : accessibleLabel}
          </span>
        )}
      </span>
      {trimmedName ? (
        <span className="ui:border-border ui:block ui:w-full ui:border-t ui:px-4 ui:py-3 ui:text-center ui:text-sm ui:font-medium ui:leading-snug ui:text-foreground">
          {trimmedName}
        </span>
      ) : null}
    </>
  );

  const className =
    "partner-logo-card ui:group ui:flex ui:w-full ui:flex-col ui:items-center ui:overflow-hidden ui:rounded-lg ui:border ui:border-border ui:bg-card ui:shadow-sm ui:transition-all hover:ui:-translate-y-0.5 hover:ui:border-primary/45 hover:ui:shadow-md focus-visible:ui:outline-none focus-visible:ui:ring-2 focus-visible:ui:ring-ring focus-visible:ui:ring-offset-2";

  if (href) {
    return (
      <a
        aria-label={
          trimmedName ? `Visit ${trimmedName}` : `Visit ${accessibleLabel}`
        }
        className={className}
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        {content}
      </a>
    );
  }

  return <div className={className}>{content}</div>;
}
