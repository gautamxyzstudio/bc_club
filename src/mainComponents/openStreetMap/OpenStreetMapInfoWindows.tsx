/* eslint-disable @typescript-eslint/no-explicit-any */
import { Popup } from "react-leaflet";
import { Images } from "@/src/app/exports";
import LineGradient from "@/src/components/common/lineGradient/LineGradient";
import Description, {
  IDescriptionTypes,
} from "@/src/components/description/Description";
import Image from "next/image";

export function OpenStreetMapPropertyPopup({
  selectedProperty,
  popupRef,
  onClose,
  status,
}: {
  selectedProperty: any;
  popupRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
  status?: string;
}) {
  if (!selectedProperty) return null;

  const displayTitle =
    selectedProperty.property_sub_type === "Single Family"
      ? selectedProperty.structure_type
      : selectedProperty.property_sub_type;

  const displayRealtor = selectedProperty.office_name;
  const displayMls = `MLS® ${selectedProperty.listing_id}`;
  return (
    <Popup
      position={[selectedProperty.latitude, selectedProperty.longitude]}
      eventHandlers={{ remove: onClose }}
      offset={[0, 0]}
      closeButton
      autoPan
    >
      <div
        ref={popupRef}
        style={{
          width: 260,
          background: "white",
          borderRadius: 6,
          fontFamily: "Plus Jakarta Display",
          cursor:
            selectedProperty.status === "Expired" ? "not-allowed" : "pointer",
          padding: 4,
        }}
        onClick={(e) => {
          e.stopPropagation();
          const isForeclosureProp =
            status === "forecloser" ||
            status === "forcecloser" ||
            status === "forecloserSold" ||
            status === "forcecloserSold" ||
            selectedProperty?.status?.toLowerCase() === "forecloser" ||
            selectedProperty?.status?.toLowerCase() === "foreclosure";

          const id = selectedProperty.documentId || selectedProperty.id;

          window.open(
            isForeclosureProp
              ? `/forecloser-property-info/${id}`
              : selectedProperty.status === "Closed"
                ? `/sold-property-info/${id}`
                : selectedProperty.status === "Expired"
                  ? "#"
                  : `/property-info/${id}`,
            `_blank`,
          );
        }}
      >
        <div
          style={{
            width: "100%",
            height: 130,
            overflow: "hidden",
            borderRadius: 3,
            backgroundColor: "#f1f5f9",
          }}
        >
          <Image
            src={selectedProperty.media_url || Images.apartment}
            alt={selectedProperty.title}
            width={252}
            height={130}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        <div
          style={{
            padding: "12px 2px 4px 2px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <h3
            style={{
              margin: 0,
              color: "#305487",
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            ${Number(selectedProperty.price).toLocaleString()}
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 700,
              color: "#333",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {displayTitle}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: "#6e6e6e",
              lineHeight: 1.4,
              fontWeight: 500,
            }}
          >
            {selectedProperty.address}
          </p>
          <LineGradient />
          <div className="w-full flex flex-row flex-wrap items-start justify-between gap-1">
            <div className="min-w-0 flex-1" title={displayRealtor}>
              <Description
                content={displayRealtor}
                type={IDescriptionTypes.dec12}
                customClasses="text-lightWhite my-0!"
              />
            </div>

            <div className="min-w-0 shrink-0">
              <Description
                content={displayMls}
                type={IDescriptionTypes.dec12}
                customClasses="text-lightWhite my-0!"
              />
            </div>
          </div>
        </div>
      </div>
    </Popup>
  );
}

export function OpenStreetMapClusterPopup({
  selectedClusterProperties,
  stableClusterPosition,
  onClose,
}: {
  selectedClusterProperties: any[];
  stableClusterPosition: { lat: number; lng: number } | null;
  onClose: () => void;
}) {
  if (selectedClusterProperties.length === 0 || !stableClusterPosition)
    return null;
  return (
    <Popup
      position={[stableClusterPosition.lat, stableClusterPosition.lng]}
      eventHandlers={{ remove: onClose }}
      closeButton
      autoPan
    >
      <div
        style={{
          width: 300,
          maxHeight: 320,
          overflowY: "auto",
          padding: 8,
          fontFamily: "Plus Jakarta Display",
        }}
      >
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
          Properties ({selectedClusterProperties.length})
        </h3>

        {selectedClusterProperties.map((p) => (
          <div
            key={p.documentId}
            onClick={(e) => {
              e.stopPropagation();
              window.open(
                p.status === "Closed"
                  ? `/sold-property-info/${p.documentId}`
                  : p.status === "Expired"
                    ? "#"
                    : `/property-info/${p.documentId}`,
                `_blank`,
              );
            }}
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 12,
              cursor: p.status === "Expired" ? "not-allowed" : "pointer",
              borderBottom: "1px solid #eee",
              paddingBottom: 10,
            }}
          >
            <Image
              src={p.media_url || Images.apartment}
              alt={p.address}
              width={70}
              height={55}
              style={{
                // width: 70,
                // height: 55,
                objectFit: "cover",
                borderRadius: 6,
                background: "#f1f5f9",
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#305487" }}>
                ${Number(p.price).toLocaleString()}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#444",
                  fontWeight: 600,
                  marginTop: 2,
                }}
              >
                {p.title === "Single Family" ? p.structureType : p.title}
              </div>
              <div style={{ fontSize: 11, color: "#777", marginTop: 2 }}>
                {p.address}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Popup>
  );
}
