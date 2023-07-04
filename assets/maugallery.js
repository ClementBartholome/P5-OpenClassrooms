/* eslint-disable no-undef */
/* eslint-disable no-redeclare */
/* eslint-disable no-var */
/* eslint-disable no-plusplus */
/* eslint-disable no-console */
/* eslint-disable no-param-reassign */
/* eslint-disable func-names */

(function ($) {
  $.fn.mauGallery = function (options) {
    var options = $.extend($.fn.mauGallery.defaults, options);
    const tagsCollection = [];

    return this.each(function () {
      $.fn.mauGallery.methods.createRowWrapper($(this));
      if (options.lightBox) {
        $.fn.mauGallery.methods.createLightBox(
          $(this),
          options.lightboxId,
          options.navigation
        );
      }
      $.fn.mauGallery.listeners(options);

      $(this)
        .children(".gallery-item")
        .each(function () {
          $.fn.mauGallery.methods.responsiveImageItem($(this));
          $.fn.mauGallery.methods.moveItemInRowWrapper($(this));
          $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);
          const theTag = $(this).data("gallery-tag");
          if (
            options.showTags &&
            theTag !== undefined &&
            tagsCollection.indexOf(theTag) === -1
          ) {
            tagsCollection.push(theTag);
          }
        });

      if (options.showTags) {
        $.fn.mauGallery.methods.showItemTags(
          $(this),
          options.tagsPosition,
          tagsCollection
        );
      }

      $(this).fadeIn(500);
    });
  };

  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true,
  };

  $.fn.mauGallery.listeners = function (options) {
    $(".gallery-item").on("click", function () {
      if (options.lightBox && $(this).prop("tagName") === "IMG") {
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      }
    });

    $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);
    $(".gallery").on("click", ".mg-prev", () =>
      $.fn.mauGallery.methods.prevImage(options.lightboxId)
    );
    $(".gallery").on("click", ".mg-next", () =>
      $.fn.mauGallery.methods.nextImage(options.lightboxId)
    );
  };

  $.fn.mauGallery.methods = {
    createRowWrapper(element) {
      if (!element.children().first().hasClass("row")) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    },

    wrapItemInColumn(element, columns) {
      if (columns.constructor === Number) {
        element.wrap(
          `<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`
        );
      } else if (columns.constructor === Object) {
        let columnClasses = "";
        if (columns.xs) {
          columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        }
        if (columns.sm) {
          columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        }
        if (columns.md) {
          columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        }
        if (columns.lg) {
          columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        }
        if (columns.xl) {
          columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        }
        element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
      } else {
        console.error(
          `Columns should be defined as numbers or objects. ${typeof columns} is not supported.`
        );
      }
    },

    moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    },

    responsiveImageItem(element) {
      if (element.prop("tagName") === "IMG") {
        element.addClass("img-fluid");
      }
    },

    openLightBox(element, lightboxId) {
      $(`#${lightboxId}`)
        .find(".lightboxImage")
        .attr("src", element.attr("src"));
      $(`#${lightboxId}`).modal("toggle");
    },

    prevImage() {
      const activeImageSrc = $(".lightboxImage").attr("src");
      const activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      const imagesCollection = [];
      let index = 0;

      if (activeTag === "all") {
        $(".item-column img").each(function (i) {
          imagesCollection.push($(this).attr("src"));
          if ($(this).attr("src") === activeImageSrc) {
            index = i;
          }
        });
      } else {
        $(`.item-column img[data-gallery-tag='${activeTag}']`).each(function (
          i
        ) {
          imagesCollection.push($(this).attr("src"));
          if ($(this).attr("src") === activeImageSrc) {
            index = i;
          }
        });
      }

      index--;

      const next =
        imagesCollection[index] ||
        imagesCollection[imagesCollection.length - 1];
      $(".lightboxImage").attr("src", next);
    },

    nextImage() {
      const activeImageSrc = $(".lightboxImage").attr("src");
      const activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      const imagesCollection = [];
      let index = 0;

      if (activeTag === "all") {
        $(".item-column img").each(function (i) {
          imagesCollection.push($(this).attr("src"));
          if ($(this).attr("src") === activeImageSrc) {
            index = i;
          }
        });
      } else {
        $(`.item-column img[data-gallery-tag='${activeTag}']`).each(function (
          i
        ) {
          imagesCollection.push($(this).attr("src"));
          if ($(this).attr("src") === activeImageSrc) {
            index = i;
          }
        });
      }

      index++;

      const next = imagesCollection[index] || imagesCollection[0];
      $(".lightboxImage").attr("src", next);
    },

    modalNavigation() {
      $(".modal").on("keydown", function (e) {
        if ($(this).hasClass("show")) {
          if (e.keyCode === 37) {
            $.fn.mauGallery.methods.prevImage();
          } else if (e.keyCode === 39) {
            $.fn.mauGallery.methods.nextImage();
          }
        }
      });
    },

    createLightBox(gallery, lightboxId, navigation) {
      gallery.append(`<div class="modal fade" id="${
        lightboxId || "galleryLightbox"
      }" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-body">
                            ${
                              navigation
                                ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>'
                                : '<span style="display:none;" />'
                            }
                            <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
                            ${
                              navigation
                                ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>'
                                : '<span style="display:none;" />'
                            }
                        </div>
                    </div>
                </div>
            </div>`);

      if (navigation) {
        this.modalNavigation();
      }
    },

    showItemTags(gallery, position, tags) {
      let tagItems =
        '<li class="nav-item"><span class="nav-link active active-tag"  data-images-toggle="all">Tous</span></li>';
      $.each(tags, (index, value) => {
        tagItems += `<li class="nav-item active">
                <span class="nav-link"  data-images-toggle="${value}">${value}</span></li>`;
      });
      const tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

      if (position === "bottom") {
        gallery.append(tagsRow);
      } else if (position === "top") {
        gallery.prepend(tagsRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    },

    filterByTag() {
      if ($(this).hasClass("active")) {
        return;
      }

      const tag = $(this).data("images-toggle");

      $(".gallery-item").each(function () {
        $(this).parents(".item-column").hide();
        if (tag === "all" || $(this).data("gallery-tag") === tag) {
          $(this).parents(".item-column").show(300);
        }
      });

      // Remove / add the correct class ("active") for styling
      // removeClass on the correct target ("nav-link")
      $(".nav-link").removeClass("active");
      $(this).addClass("active");
    },
  };
})(jQuery);
