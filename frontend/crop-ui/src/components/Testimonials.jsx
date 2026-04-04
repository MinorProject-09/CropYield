const testimonials = [
  {
    name: "Rajesh Kumar",
    location: "Punjab",
    crop: "Wheat Farmer",
    quote: "CropYield AI helped me choose the right crop for my soil. My yield increased by 25% this season!",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    location: "Maharashtra",
    crop: "Cotton Farmer",
    quote: "The voice input feature is amazing. I can use it in my local language without any hassle.",
    rating: 5,
  },
  {
    name: "Anil Patel",
    location: "Gujarat",
    crop: "Groundnut Farmer",
    quote: "Accurate predictions and easy to use. Saved me from wrong crop choices multiple times.",
    rating: 5,
  },
];

function Testimonials() {
  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-green-700 text-sm font-semibold uppercase tracking-widest">Success Stories</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
            What Farmers Say
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            Real feedback from farmers using CropYield AI across India.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400">⭐</span>
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">"{t.quote}"</p>
              <div className="border-t pt-4">
                <p className="font-semibold text-gray-900">{t.name}</p>
                <p className="text-sm text-gray-500">{t.crop}, {t.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;