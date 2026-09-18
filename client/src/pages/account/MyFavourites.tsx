import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client.js";
import { PropertyCard } from "../../components/property/PropertyCard.js";
import { Heart, Search } from "lucide-react";

export const MyFavourites: React.FC = () => {
  const [favourites, setFavourites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavourites = async () => {
    try {
      const res = await api.get("/properties/favourites");
      const list = res.data.data || res.data || [];
      setFavourites(list);
    } catch (err) {
      console.error("Failed to load favourites", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavourites();
  }, []);

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 font-['Outfit']">My Favourites</h1>
          <p className="text-xs text-slate-500">Quick access to properties you have bookmarked while browsing.</p>
        </div>
        <Link
          to="/real-estate"
          className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Search className="w-4 h-4" />
          <span>Browse More Properties</span>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400">Loading saved properties...</div>
      ) : favourites.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm space-y-4">
          <Heart className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Favourites Saved Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click the heart icon on any property card to save properties for easy reference.
          </p>
          <Link
            to="/real-estate"
            className="inline-block bg-red-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl"
          >
            Explore Real Estate
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favourites.map((fav) => {
            const prop = fav.property || fav;
            return (
              <PropertyCard
                key={prop.id || fav.id}
                property={{ ...prop, isFavourite: true }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyFavourites;
